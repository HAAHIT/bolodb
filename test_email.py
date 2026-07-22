import asyncio
import os
from backend.app.services.email import send_workspace_invite_email


async def main():
    print("API KEY:", os.environ.get("RESEND_API_KEY") is not None)
    success = await send_workspace_invite_email(
        "somesh@test.com", "Test Workspace", "123456"
    )
    print("Success:", success)


if __name__ == "__main__":
    asyncio.run(main())
