export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const SESSION_TOKEN_KEY = 'admin_token';
const SESSION_EXPIRES_KEY = 'admin_token_expires_at';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export const session = {
  get: () => {
    try {
      const token = localStorage.getItem(SESSION_TOKEN_KEY);
      const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY));
      if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(SESSION_EXPIRES_KEY);
        return null;
      }
      return token;
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(SESSION_EXPIRES_KEY, String(Date.now() + SESSION_DURATION_MS));
    } catch {
      // The API still returns a useful error if browser storage is disabled.
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_EXPIRES_KEY);
    } catch {
      // Ignore storage cleanup failures during logout.
    }
  },
};
export async function api<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = session.get();
    if (!token) throw new ApiError('Entre novamente para continuar.', 401);
    headers.set('Authorization', `Bearer ${token}`);
  }
  let response: Response;
  try { response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: options.signal || AbortSignal.timeout(30_000) }); }
  catch { throw new ApiError('Não foi possível conectar ao servidor. Tente novamente.', 0); }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 && authenticated) { session.clear(); window.dispatchEvent(new Event('session-expired')); }
    throw new ApiError(typeof data?.error === 'string' ? data.error : 'Não foi possível concluir a solicitação.', response.status);
  }
  if (response.status === 204) return undefined as T;
  if (!response.headers.get('content-type')?.includes('application/json')) throw new ApiError('O servidor retornou uma resposta inválida.', 502);
  return response.json().then(data => resolveImageUrls(data)) as Promise<T>;
}
// Image paths belong to the API even when frontend and backend use separate domains.
function resolveImageUrls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(resolveImageUrls);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    key === 'imageUrl' && typeof item === 'string' && item.startsWith('/api/images/')
      ? `${API_URL}/images/${item.slice('/api/images/'.length)}` : resolveImageUrls(item),
  ]));
  return value;
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente.';
