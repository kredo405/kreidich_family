// Lightweight client helpers for the frontend to call the API routes

export async function saveFlowToServer(nodes: any[], edges: any[], flowId?: string) {
  const res = await fetch('/api/flow/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges, flowId }),
  });
  return res.json();
}

export async function loadFlowFromServer() {
  const res = await fetch('/api/flow/load');
  return res.json();
}

export async function createPersonOnServer(payload: any) {
  const res = await fetch('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updatePersonOnServer(id: string, payload: any) {
  const res = await fetch(`/api/people/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deletePersonOnServer(id: string) {
  const res = await fetch(`/api/people/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function getPeopleFromServer() {
  const res = await fetch('/api/people');
  return res.json();
}
