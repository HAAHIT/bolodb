from typing import Any, Literal, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

RoleLiteral = Literal["admin", "member"]


class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceMemberRoleUpdate(BaseModel):
    role: RoleLiteral


class WorkspaceInviteCreate(BaseModel):
    email: EmailStr
    role: RoleLiteral = "member"


class WorkspaceUpdate(BaseModel):
    name: str | None = None


class ActivityLogResponse(BaseModel):
    id: str
    workspace_id: str
    actor_id: Optional[str] = None
    actor_email: Optional[str] = None
    event_type: str
    resource_type: str
    resource_id: Optional[str] = None
    metadata_: dict[str, Any]
    created_at: datetime
