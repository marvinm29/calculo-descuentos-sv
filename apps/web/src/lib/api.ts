import { useAuth } from '@clerk/react';
const env = import.meta.env as Record<string, string>;

const API_URL: string = env['VITE_API_URL'] ?? 'http://localhost:3001';

export function getApiUrl(): string {
  return API_URL;
}

export function useAuthFetch() {
  const { getToken } = useAuth();

  async function authFetch(path: string, options?: RequestInit): Promise<Response> {
    const token = await getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> | undefined),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`${API_URL}${path}`, { ...options, headers });
  }

  return { authFetch };
}
