# Update api.ts
with open("frontend/src/lib/api.ts", "r") as f:
    content = f.read()

content = content.replace(
    'const activeDbId =\n    typeof window !== "undefined"\n      ? localStorage.getItem("bolodb_active_db_id")\n      : null;',
    """const activeDbId =
    typeof window !== "undefined" && activeWorkspaceId
      ? localStorage.getItem(`bolodb_active_db_id_${activeWorkspaceId}`)
      : null;""",
)

with open("frontend/src/lib/api.ts", "w") as f:
    f.write(content)

# Update appState.svelte.ts
with open("frontend/src/lib/appState.svelte.ts", "r") as f:
    content = f.read()

content = content.replace(
    'localStorage.setItem("bolodb_active_db_id", res.db_id);',
    "if (this.activeWorkspace) localStorage.setItem(`bolodb_active_db_id_${this.activeWorkspace.id}`, res.db_id);",
)
content = content.replace(
    'localStorage.setItem("bolodb_active_db_id", dbId);',
    "if (this.activeWorkspace) localStorage.setItem(`bolodb_active_db_id_${this.activeWorkspace.id}`, dbId);",
)
content = content.replace(
    'localStorage.removeItem("bolodb_active_db_id");',
    "if (this.activeWorkspace) localStorage.removeItem(`bolodb_active_db_id_${this.activeWorkspace.id}`);",
)

with open("frontend/src/lib/appState.svelte.ts", "w") as f:
    f.write(content)

# Update workspaces/+page.svelte
with open("frontend/src/routes/workspaces/+page.svelte", "r") as f:
    content = f.read()

content = content.replace(
    'localStorage.removeItem("bolodb_active_db_id");',
    '// localStorage.removeItem("bolodb_active_db_id"); // Persist per workspace',
)

with open("frontend/src/routes/workspaces/+page.svelte", "w") as f:
    f.write(content)
