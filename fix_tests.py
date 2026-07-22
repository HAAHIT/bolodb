import os
import re

TEST_DIR = "tests"


def replace_in_file(path, replacements):
    with open(path, "r") as f:
        content = f.read()

    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)

    # Also handle kwargs like user_token={"user_id": "u1"} -> workspace={"id": "w1"}
    new_content = re.sub(
        r'user_token=\{"user_id":\s*([^}]+)\}', r'workspace={"id": \1}', new_content
    )
    new_content = new_content.replace("user_token", "workspace")

    if new_content != content:
        with open(path, "w") as f:
            f.write(new_content)
        print(f"Updated {path}")


for file in os.listdir(TEST_DIR):
    if not file.endswith(".py"):
        continue

    # Don't touch auth/user related tests which legitimately test user flows
    if file in [
        "test_pgdatabase_users.py",
        "test_email_verification.py",
        "test_supabase_auth.py",
        "test_migration_0005.py",
    ]:
        continue

    path = os.path.join(TEST_DIR, file)
    replace_in_file(
        path,
        [
            ("user_id", "workspace_id"),
            ("db-u1", "db-w1"),
            ('"u1"', '"w1"'),
            ("'u1'", "'w1'"),
        ],
    )
