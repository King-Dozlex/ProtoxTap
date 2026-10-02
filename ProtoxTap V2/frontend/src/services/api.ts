export interface User {
  id: number;
  username: string;
}

export interface Business {
  id: number;
  businessName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

export type CardStatus = "unassigned" | "inactive" | "active";

export interface Card {
  id: number;
  cardCode: string;
  businessId: number | null;
  businessName: string | null;
  redirectUrl: string | null;
  status: CardStatus;
  createdAt: string;
  activatedAt: string | null;
  deactivatedAt: string | null;
}

export async function deleteCard(id: number): Promise<void> {
  await request(`/api/cards/${id}`, {
    method: "DELETE",
  });
}

export interface BusinessInput {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface AssignCardInput {
  businessId: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `Request failed (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

export async function login(username: string, password: string): Promise<void> {
  await request<{ message: string; username: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  await request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "include" });
    if (response.status === 401) return null;
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        typeof payload === "object" && payload !== null && "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : `Request failed (${response.status}).`;
      throw new Error(message);
    }
    const result = payload as { authenticated: boolean; user?: User };
    return result.authenticated ? result.user ?? null : null;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Unable to reach the server. Check that the backend is running.");
    }
    throw error;
  }
}

export function getBusinesses(): Promise<Business[]> {
  return request("/api/businesses");
}

export function getBusiness(id: number): Promise<Business> {
  return request(`/api/businesses/${id}`);
}

export function createBusiness(data: BusinessInput): Promise<Business> {
  return request("/api/businesses", { method: "POST", body: JSON.stringify(data) });
}

export function updateBusiness(id: number, data: BusinessInput): Promise<Business> {
  return request(`/api/businesses/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteBusiness(id: number): Promise<{ message: string }> {
  return request(`/api/businesses/${id}`, { method: "DELETE" });
}

export function getCards(): Promise<Card[]> {
  return request("/api/cards");
}

export function getCard(id: number): Promise<Card> {
  return request(`/api/cards/${id}`);
}

export function createCard(cardCode: string): Promise<Card> {
  return request("/api/cards", { method: "POST", body: JSON.stringify({ cardCode }) });
}

export function assignCard(id: number, data: AssignCardInput): Promise<Card> {
  return request(`/api/cards/${id}/assign`, { method: "POST", body: JSON.stringify(data) });
}

export function activateCard(id: number): Promise<Card> {
  return request(`/api/cards/${id}/activate`, { method: "POST" });
}

export function deactivateCard(id: number): Promise<Card> {
  return request(`/api/cards/${id}/deactivate`, { method: "POST" });
}
