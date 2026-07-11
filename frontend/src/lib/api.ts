/** BoloDB — API helpers */

export async function apiCall(
  path: string,
  body?: unknown,
  method?: string,
): Promise<any> {
  const opts: RequestInit = {
    method: method || (body ? "POST" : "GET"),
  };
  if (body) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  opts.credentials = "include";
  const r = await fetch(path, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail || `Request failed: ${r.status}`);
  return data;
}

export async function getHistory(limit?: number): Promise<any> {
  const params = limit ? `?limit=${limit}` : "";
  return apiCall(`/api/history${params}`);
}

export async function getHistoryStats(): Promise<any> {
  return apiCall("/api/history/stats");
}

export async function deleteHistoryEntry(id: string): Promise<any> {
  return apiCall(`/api/history/${id}`, undefined, "DELETE");
}

export async function clearHistory(): Promise<any> {
  return apiCall("/api/history", undefined, "DELETE");
}

// --- Conversations ---

export async function getConversations(): Promise<any> {
  return apiCall("/api/conversations");
}

export async function createConversation(
  title?: string,
  databaseId?: string,
): Promise<any> {
  return apiCall("/api/conversations", {
    title: title || "",
    database_id: databaseId,
  });
}

export async function getConversation(id: string): Promise<any> {
  return apiCall(`/api/conversations/${id}`);
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<any> {
  return apiCall(`/api/conversations/${id}`, { title }, "PATCH");
}

export async function deleteConversation(id: string): Promise<any> {
  return apiCall(`/api/conversations/${id}`, undefined, "DELETE");
}

export async function clearConversations(): Promise<any> {
  return apiCall("/api/conversations", undefined, "DELETE");
}

/** Convert API rows (array of objects) to 2D string arrays for ResultTable */
export function rowsToArrays(
  columns: string[],
  rows: Record<string, unknown>[],
): string[][] {
  return (rows || []).map((row) =>
    (columns || []).map((col) => {
      const v = row[col];
      return v === null || v === undefined ? "" : String(v);
    }),
  );
}
