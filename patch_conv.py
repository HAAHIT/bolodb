with open("backend/app/pgdatabase/conversations.py", "r") as f:
    code = f.read()

# Replace `"id": conv.id,` with `"id": conv.id, "_id": conv.id,`
code = code.replace('"id": conv.id,', '"id": conv.id, "_id": conv.id,')

with open("backend/app/pgdatabase/conversations.py", "w") as f:
    f.write(code)
