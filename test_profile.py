import asyncio
from backend.app.pgdatabase.engine import async_session
from backend.app.pgdatabase.users import update_user, get_user_by_email
from sqlalchemy import text


async def main():
    async with async_session() as session:
        result = await session.execute(text("SELECT id, email FROM users LIMIT 1"))
        row = result.fetchone()
        if not row:
            print("No users")
            return
        uid = str(row[0])
        email = row[1]

    print("Updating user", email, uid)
    success = await update_user(uid, first_name="John", last_name="Doe")
    print("Update success:", success)

    user = await get_user_by_email(email)
    print("First name:", user.get("first_name"))
    print("Last name:", user.get("last_name"))


if __name__ == "__main__":
    asyncio.run(main())
