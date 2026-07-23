import logging
import re
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import aliased
from backend.app.services.email import send_workspace_invite_email
from backend.app.pgdatabase.engine import async_session
from backend.app.models.workspace import Workspace, WorkspaceMember, WorkspaceInvite
from backend.app.models.orm_user import User
from backend.app.pgdatabase.serialization import _to_uuid
from backend.app.controllers.activity import log_activity


log = logging.getLogger(__name__)

INVITE_EXPIRY_DAYS = 7

_EMAIL_ADAPTER = TypeAdapter(EmailStr)


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


# Crockford base32: no I, L, O or U, so a code survives being read aloud or
# copied by hand without the 1/I and 0/O confusions.
_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def generate_invite_code() -> str:
    """A short, human-readable invite code in the form BOLO-XXXX-XXXX."""
    body = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(8))
    return f"BOLO-{body[:4]}-{body[4:]}"


def normalize_invite_code(token: str) -> str:
    """Canonicalise a pasted code so casing, spaces and stray hyphens still match.

    Only applied to codes in our own format — legacy UUID tokens are left as
    typed, since they are lowercase and hyphen-significant.
    """
    if not token:
        return ""
    stripped = token.strip()
    compact = re.sub(r"[\s-]+", "", stripped).upper()
    if not compact.startswith("BOLO") or len(compact) != 12:
        return stripped
    return f"BOLO-{compact[4:8]}-{compact[8:]}"


async def list_workspaces(user_id: str):
    uid = _to_uuid(user_id)
    async with async_session() as session:
        # `member_count` powers the sidebar workspace pills. A correlated
        # scalar subquery keeps this one round trip rather than one COUNT per
        # workspace.
        member_count = (
            select(func.count())
            .select_from(WorkspaceMember)
            .where(WorkspaceMember.workspace_id == Workspace.id)
            .scalar_subquery()
        )
        membership = aliased(WorkspaceMember)
        result = await session.execute(
            select(Workspace, membership.role, member_count)
            .join(membership, Workspace.id == membership.workspace_id)
            .where(membership.user_id == uid)
            .order_by(Workspace.created_at.desc())
        )
        rows = result.all()
        return [
            {
                "id": str(r[0].id),
                "name": r[0].name,
                "slug": r[0].slug,
                "role": r[1],
                "member_count": r[2],
                "created_at": r[0].created_at,
            }
            for r in rows
        ]


async def create_workspace(user_id: str, name: str):
    uid = _to_uuid(user_id)
    base_slug = slugify(name) or "workspace"

    max_attempts = 10
    slug = base_slug

    for attempt in range(max_attempts):
        async with async_session() as session:
            try:
                if attempt > 0:
                    slug = f"{base_slug}-{attempt}"

                exists = await session.execute(
                    select(Workspace).where(Workspace.slug == slug)
                )
                if exists.scalar_one_or_none():
                    continue

                workspace = Workspace(name=name, slug=slug, created_by=uid)
                session.add(workspace)
                await session.flush()

                member = WorkspaceMember(
                    workspace_id=workspace.id, user_id=uid, role="owner"
                )
                session.add(member)
                await session.commit()
                await log_activity(
                    str(workspace.id),
                    user_id,
                    "workspace.created",
                    "workspace",
                    str(workspace.id),
                    {"name": name},
                )
                return {
                    "id": str(workspace.id),
                    "name": workspace.name,
                    "slug": workspace.slug,
                    "role": "owner",
                }
            except IntegrityError:
                await session.rollback()
                continue

    raise HTTPException(500, "Could not generate a unique workspace slug")


async def get_workspace(workspace_id: str, user_id: str):
    wid = _to_uuid(workspace_id)
    uid = _to_uuid(user_id)
    async with async_session() as session:
        result = await session.execute(
            select(Workspace, WorkspaceMember.role)
            .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
            .where(Workspace.id == wid, WorkspaceMember.user_id == uid)
        )
        row = result.first()
        if not row:
            raise HTTPException(404, "Workspace not found")
        return {
            "id": str(row[0].id),
            "name": row[0].name,
            "slug": row[0].slug,
            "role": row[1],
            "created_at": row[0].created_at,
        }


async def update_workspace(
    workspace_id: str, name: str | None, actor_id: str | None = None
):
    wid = _to_uuid(workspace_id)
    async with async_session() as session:
        try:
            from sqlalchemy import update

            stmt = update(Workspace).where(Workspace.id == wid)
            values = {}
            if name is not None:
                values["name"] = name.strip()
            if values:
                stmt = stmt.values(**values)
                result = await session.execute(stmt)
                await session.commit()

                await log_activity(
                    workspace_id,
                    actor_id,
                    "workspace.updated",
                    "workspace",
                    workspace_id,
                    values,
                )
                return {"ok": result.rowcount > 0, "name": values.get("name")}
            return {"ok": True}
        except Exception:
            await session.rollback()
            raise


async def delete_workspace(workspace_id: str, actor_id: str | None = None):
    """Delete a workspace and everything scoped to it.

    Every workspace-scoped table declares ``ondelete="CASCADE"`` against
    ``workspaces.id``, so removing this one row takes members, invites, activity,
    catalog, conversations, dashboards and saved queries with it. That includes
    the workspace's own activity log, so the deletion is recorded to the
    application log rather than to an audit row that is about to vanish.
    """
    wid = _to_uuid(workspace_id)
    async with async_session() as session:
        workspace = await session.get(Workspace, wid)
        if not workspace:
            raise HTTPException(404, "Workspace not found")
        name = workspace.name
        await session.delete(workspace)
        await session.commit()

    log.info("workspace.deleted id=%s name=%r actor=%s", workspace_id, name, actor_id)
    return {"ok": True}


async def leave_workspace(workspace_id: str, user_id: str):
    """Remove the calling user from a workspace.

    A sole owner cannot leave — they must transfer ownership or delete the
    workspace, otherwise it would be left with nobody able to administer it.
    """
    wid = _to_uuid(workspace_id)
    uid = _to_uuid(user_id)
    async with async_session() as session:
        result = await session.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == wid, WorkspaceMember.user_id == uid
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(404, "Member not found")

        if member.role == "owner":
            owners_count = await session.scalar(
                select(func.count())
                .select_from(WorkspaceMember)
                .where(
                    WorkspaceMember.workspace_id == wid,
                    WorkspaceMember.role == "owner",
                )
            )
            if owners_count <= 1:
                raise HTTPException(
                    400,
                    "You are the sole owner — transfer ownership or delete the workspace first",
                )

        await session.delete(member)
        await session.commit()

    await log_activity(workspace_id, user_id, "member.left", "member", user_id, {})
    return {"ok": True}


async def list_members(workspace_id: str):
    wid = _to_uuid(workspace_id)
    async with async_session() as session:
        result = await session.execute(
            select(WorkspaceMember, User.email)
            .join(User, WorkspaceMember.user_id == User.id)
            .where(WorkspaceMember.workspace_id == wid)
        )
        rows = result.all()
        return [
            {
                "user_id": str(r[0].user_id),
                "email": r[1],
                "role": r[0].role,
                "joined_at": r[0].joined_at,
                "created_at": r[0].joined_at,
            }
            for r in rows
        ]


async def invite_user(workspace_id: str, email: str, role: str, inviter_id: str):
    wid = _to_uuid(workspace_id)
    uid = _to_uuid(inviter_id)
    if role not in ["admin", "member"]:
        raise HTTPException(400, "Invalid role for invite")

    async with async_session() as session:
        # Check if user is already a member
        user_exists = await session.execute(select(User).where(User.email == email))
        user = user_exists.scalar_one_or_none()
        if user:
            member = await session.execute(
                select(WorkspaceMember).where(
                    WorkspaceMember.workspace_id == wid,
                    WorkspaceMember.user_id == user.id,
                )
            )
            if member.scalar_one_or_none():
                raise HTTPException(400, "User is already a member")

        token = generate_invite_code()
        expires = datetime.now(timezone.utc) + timedelta(days=INVITE_EXPIRY_DAYS)

        # Query existing invite for this workspace + email
        existing = await session.execute(
            select(WorkspaceInvite).where(
                WorkspaceInvite.workspace_id == wid,
                WorkspaceInvite.email == email,
            )
        )
        invite = existing.scalar_one_or_none()

        if invite:
            invite.role = role
            invite.token = token
            invite.invited_by = uid
            invite.expires_at = expires
            invite.accepted_at = None
        else:
            invite = WorkspaceInvite(
                workspace_id=wid,
                email=email,
                role=role,
                token=token,
                invited_by=uid,
                expires_at=expires,
            )
            session.add(invite)

        try:
            await session.commit()

            # Fetch workspace name for email
            ws = await session.get(Workspace, wid)
            if ws:
                await send_workspace_invite_email(email, ws.name, token)

            await log_activity(
                workspace_id,
                inviter_id,
                "member.invited",
                "member",
                str(invite.id),
                {"email": email, "role": role},
            )
            return {
                "id": str(invite.id),
                "email": invite.email,
                "role": invite.role,
                "token": invite.token,
                "expires_at": invite.expires_at,
            }
        except IntegrityError:
            await session.rollback()
            raise HTTPException(400, "Could not process invite")


async def update_member_role(
    workspace_id: str,
    target_user_id: str,
    role: str,
    actor_id: str | None = None,
    actor_role: str = "admin",
):
    wid = _to_uuid(workspace_id)
    tuid = _to_uuid(target_user_id)
    if role not in ["admin", "member"]:
        raise HTTPException(400, "Invalid role")

    role_rank = {"member": 1, "admin": 2, "owner": 3}
    actor_rank = role_rank.get(actor_role, 0)
    if actor_rank < role_rank["admin"]:
        raise HTTPException(403, "Insufficient permissions")

    async with async_session() as session:
        result = await session.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == wid, WorkspaceMember.user_id == tuid
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(404, "Member not found")

        target_rank = role_rank.get(member.role, 0)
        # Callers may only modify members strictly below their own rank.
        if target_rank >= actor_rank:
            raise HTTPException(
                403, "Cannot change the role of a member at or above your own level"
            )
        if role_rank.get(role, 0) >= actor_rank:
            raise HTTPException(403, "Cannot assign a role at or above your own level")

        if member.role == "owner" and role != "owner":
            owners_count = await session.scalar(
                select(func.count())
                .select_from(WorkspaceMember)
                .where(
                    WorkspaceMember.workspace_id == wid,
                    WorkspaceMember.role == "owner",
                )
            )
            if owners_count <= 1:
                raise HTTPException(
                    400, "Cannot change role of the sole workspace owner"
                )

        member.role = role
        await session.commit()
        await log_activity(
            workspace_id,
            actor_id,
            "member.role_updated",
            "member",
            target_user_id,
            {"new_role": role},
        )
        return {"ok": True}


async def transfer_ownership(
    workspace_id: str, current_owner_id: str, target_user_id: str
):
    """Hand the owner role to another member, demoting the caller to admin.

    Both role changes happen in one transaction so the workspace is never left
    with two owners or none.
    """
    wid = _to_uuid(workspace_id)
    if current_owner_id == target_user_id:
        raise HTTPException(400, "You already own this workspace")
    try:
        tuid = _to_uuid(target_user_id)
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(404, "Member not found")
    cuid = _to_uuid(current_owner_id)

    async with async_session() as session:
        result = await session.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == wid,
                WorkspaceMember.user_id.in_([tuid, cuid]),
            )
        )
        by_user = {m.user_id: m for m in result.scalars().all()}
        target = by_user.get(tuid)
        actor = by_user.get(cuid)
        if not target:
            raise HTTPException(404, "Member not found")
        if not actor or actor.role != "owner":
            raise HTTPException(403, "Only the owner can transfer ownership")

        target.role = "owner"
        actor.role = "admin"
        await session.commit()

    await log_activity(
        workspace_id,
        current_owner_id,
        "member.ownership_transferred",
        "member",
        target_user_id,
        {"previous_owner": current_owner_id},
    )
    return {"ok": True, "new_owner_id": target_user_id}


def _normalize_email(raw: str) -> str | None:
    """Return a validated, lower-cased address, or None if it isn't one.

    Bulk invites report bad addresses per row instead of rejecting the whole
    batch, so validation happens here rather than in the request model.
    """
    if not isinstance(raw, str):
        return None
    candidate = raw.strip().lower()
    if not candidate:
        return None
    try:
        return str(_EMAIL_ADAPTER.validate_python(candidate)).lower()
    except ValidationError:
        return None


async def bulk_invite(
    workspace_id: str, emails: list[str], role: str, inviter_id: str
) -> dict:
    """Invite many people at once, reporting the outcome for each address.

    One bad or duplicate address must not sink the rest of the batch, so each
    invite is attempted independently and its status recorded.
    """
    if role not in ["admin", "member"]:
        raise HTTPException(400, "Invalid role for invite")

    results: list[dict] = []
    seen: set[str] = set()
    for raw in emails:
        email = _normalize_email(raw)
        if not email:
            results.append({"email": (raw or "").strip(), "status": "invalid"})
            continue
        if email in seen:
            results.append({"email": email, "status": "duplicate"})
            continue
        seen.add(email)

        try:
            await invite_user(workspace_id, email, role, inviter_id)
            results.append({"email": email, "status": "invited"})
        except HTTPException as e:
            detail = str(e.detail or "")
            status = "already_member" if "already a member" in detail else "failed"
            results.append({"email": email, "status": status, "detail": detail})

    invited = sum(1 for r in results if r["status"] == "invited")
    return {"invited": invited, "total": len(results), "results": results}


async def remove_member(workspace_id: str, target_user_id: str):
    wid = _to_uuid(workspace_id)
    tuid = _to_uuid(target_user_id)
    async with async_session() as session:
        result = await session.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == wid, WorkspaceMember.user_id == tuid
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(404, "Member not found")

        if member.role == "owner":
            owners_count = await session.scalar(
                select(func.count())
                .select_from(WorkspaceMember)
                .where(
                    WorkspaceMember.workspace_id == wid,
                    WorkspaceMember.role == "owner",
                )
            )
            if owners_count <= 1:
                raise HTTPException(400, "Cannot remove the sole owner of a workspace")

        await session.delete(member)
        await session.commit()
        await log_activity(
            workspace_id, None, "member.removed", "member", target_user_id, {}
        )
        return {"ok": True}


async def get_invites(user_email: str):
    async with async_session() as session:
        now = datetime.now(timezone.utc)
        result = await session.execute(
            select(WorkspaceInvite, Workspace.name)
            .join(Workspace, WorkspaceInvite.workspace_id == Workspace.id)
            .where(
                WorkspaceInvite.email == user_email,
                WorkspaceInvite.accepted_at.is_(None),
                WorkspaceInvite.expires_at > now,
            )
        )
        rows = result.all()
        return [
            {
                "id": str(r[0].id),
                "workspace_id": str(r[0].workspace_id),
                "workspace_name": r[1],
                "role": r[0].role,
                "token": r[0].token,
                "expires_at": r[0].expires_at,
            }
            for r in rows
        ]


async def list_pending_invites(workspace_id: str):
    """Invites for this workspace that are neither accepted nor expired."""
    wid = _to_uuid(workspace_id)
    inviter = aliased(User)
    async with async_session() as session:
        now = datetime.now(timezone.utc)
        result = await session.execute(
            select(WorkspaceInvite, inviter.email)
            .outerjoin(inviter, WorkspaceInvite.invited_by == inviter.id)
            .where(
                WorkspaceInvite.workspace_id == wid,
                WorkspaceInvite.accepted_at.is_(None),
                WorkspaceInvite.expires_at > now,
            )
            .order_by(WorkspaceInvite.expires_at.desc())
        )
        return [
            {
                "id": str(r[0].id),
                "email": r[0].email,
                "role": r[0].role,
                "invited_by": r[1],
                "expires_at": r[0].expires_at,
            }
            for r in result.all()
        ]


async def _get_invite(session, wid, invite_id: str) -> WorkspaceInvite:
    try:
        iid = _to_uuid(invite_id)
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(404, "Invite not found")
    result = await session.execute(
        select(WorkspaceInvite).where(
            WorkspaceInvite.id == iid,
            WorkspaceInvite.workspace_id == wid,
        )
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(404, "Invite not found")
    return invite


async def rescind_invite(
    workspace_id: str, invite_id: str, actor_id: str | None = None
):
    wid = _to_uuid(workspace_id)
    async with async_session() as session:
        invite = await _get_invite(session, wid, invite_id)
        if invite.accepted_at:
            raise HTTPException(400, "Invite has already been accepted")
        email = invite.email
        await session.delete(invite)
        await session.commit()

    await log_activity(
        workspace_id,
        actor_id,
        "member.invite_revoked",
        "member",
        invite_id,
        {"email": email},
    )
    return {"ok": True}


async def resend_invite(workspace_id: str, invite_id: str, actor_id: str | None = None):
    """Re-send an invite email and push its expiry out.

    The existing code is kept so any already-delivered email still works; only an
    expired invite gets a fresh token.
    """
    wid = _to_uuid(workspace_id)
    async with async_session() as session:
        invite = await _get_invite(session, wid, invite_id)
        if invite.accepted_at:
            raise HTTPException(400, "Invite has already been accepted")

        now = datetime.now(timezone.utc)
        if invite.expires_at < now:
            invite.token = generate_invite_code()
        invite.expires_at = now + timedelta(days=INVITE_EXPIRY_DAYS)

        workspace = await session.get(Workspace, wid)
        workspace_name = workspace.name if workspace else None
        await session.commit()

        email, token, expires_at = invite.email, invite.token, invite.expires_at

    sent = False
    if workspace_name:
        sent = await send_workspace_invite_email(email, workspace_name, token)

    await log_activity(
        workspace_id,
        actor_id,
        "member.invite_resent",
        "member",
        invite_id,
        {"email": email},
    )
    return {"ok": True, "email_sent": sent, "expires_at": expires_at}


async def accept_invite(token: str, user_id: str, user_email: str):
    uid = _to_uuid(user_id)
    token = normalize_invite_code(token)
    async with async_session() as session:
        result = await session.execute(
            select(WorkspaceInvite).where(
                WorkspaceInvite.token == token, WorkspaceInvite.email == user_email
            )
        )
        invite = result.scalar_one_or_none()
        if not invite:
            raise HTTPException(404, "Invite not found or invalid email")
        if invite.accepted_at:
            raise HTTPException(400, "Invite already accepted")
        if invite.expires_at < datetime.now(invite.expires_at.tzinfo):
            raise HTTPException(400, "Invite expired")

        try:
            member = WorkspaceMember(
                workspace_id=invite.workspace_id, user_id=uid, role=invite.role
            )
            invite.accepted_at = datetime.now(invite.expires_at.tzinfo)
            session.add(member)
            await session.commit()
            await log_activity(
                str(invite.workspace_id),
                user_id,
                "member.joined",
                "member",
                user_id,
                {"role": invite.role},
            )
            return {"ok": True, "workspace_id": str(invite.workspace_id)}
        except IntegrityError:
            await session.rollback()
            raise HTTPException(400, "User is already a member of this workspace")
