const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api/v1';

export async function apiFetch(path: string, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function apiLogin(phone: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}
