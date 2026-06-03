export class ApiClient {
  constructor(private readonly baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '') {}
  async get<T>(path: string, init?: RequestInit): Promise<T> { const res = await fetch(this.baseUrl + path, { ...init, cache: 'no-store' }); if (!res.ok) throw new Error(await res.text()); return res.json() as Promise<T>; }
  async post<T>(path: string, body: unknown, init?: RequestInit): Promise<T> { const res = await fetch(this.baseUrl + path, { ...init, method: 'POST', headers: { 'content-type': 'application/json', ...(init?.headers || {}) }, body: JSON.stringify(body) }); if (!res.ok) throw new Error(await res.text()); return res.json() as Promise<T>; }
}
export const apiClient = new ApiClient();
