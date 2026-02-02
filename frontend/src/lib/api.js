const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = body?.error || body?.message || `Request failed: ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  get: (path) => request(path),
  post: (path, json) => request(path, { method: 'POST', body: JSON.stringify(json) }),
  patch: (path, json) => request(path, { method: 'PATCH', body: JSON.stringify(json) }),
  delete: (path) => request(path, { method: 'DELETE' })
};

