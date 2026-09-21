export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export const session = {
  get: () => sessionStorage.getItem('admin_token'),
  set: (token: string) => { localStorage.removeItem('admin_token'); sessionStorage.setItem('admin_token', token); },
  clear: () => { localStorage.removeItem('admin_token'); sessionStorage.removeItem('admin_token'); },
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
  return response.json() as Promise<T>;
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente.';
