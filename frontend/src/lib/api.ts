/**
 * API Service Layer
 * 
 * Handles all HTTP requests to the backend API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

// Base fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Ensure endpoint ends with / to avoid redirects
  const normalizedEndpoint = endpoint.endsWith('/') || endpoint.includes('?') 
    ? endpoint 
    : `${endpoint}/`;
  
  const response = await fetch(`${API_BASE_URL}/api/v1${normalizedEndpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'Request failed');
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    profession?: string;
    company?: string;
    profile_type?: string;
  }) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (email: string, password: string) =>
    fetchApi<{ access_token: string }>('/auth/login/json', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Users API
export const usersApi = {
  getMe: () => fetchApi('/users/me'),
  updateMe: (data: any) => fetchApi('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  search: (params: { q?: string; profession?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.profession) searchParams.set('profession', params.profession);
    if (params.limit) searchParams.set('limit', String(params.limit));
    return fetchApi(`/users/search?${searchParams}`);
  },
  getById: (id: string) => fetchApi(`/users/${id}`),
};

// Travels API
export const travelsApi = {
  list: (params?: { origin?: string; destination?: string; travel_date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.origin) searchParams.set('origin', params.origin);
    if (params?.destination) searchParams.set('destination', params.destination);
    if (params?.travel_date) searchParams.set('travel_date', params.travel_date);
    return fetchApi(`/travels?${searchParams}`);
  },
  create: (data: any) => fetchApi('/travels', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => fetchApi('/travels/my'),
  getById: (id: string) => fetchApi(`/travels/${id}`),
  update: (id: string, data: any) =>
    fetchApi(`/travels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/travels/${id}`, { method: 'DELETE' }),
};

// Feed API
export const feedApi = {
  get: (params?: { limit?: number; offset?: number; intent?: string; city?: string; following_only?: boolean; show_full?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.intent) searchParams.set('intent', params.intent);
    if (params?.city) searchParams.set('city', params.city);
    if (params?.following_only) searchParams.set('following_only', 'true');
    if (params?.show_full === false) searchParams.set('show_full', 'false');
    return fetchApi(`/feed?${searchParams}`);
  },
  search: (query: string, limit?: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    if (limit) searchParams.set('limit', String(limit));
    return fetchApi(`/feed/search?${searchParams}`);
  },
  nearby: (origin: string, destination: string, date: string) =>
    fetchApi(`/feed/nearby?origin=${origin}&destination=${destination}&date=${date}`),
  inCity: (city: string) => fetchApi(`/feed/in-city/${city}`),
};

// Intents API
export const intentsApi = {
  list: () => fetchApi('/intents'),
  categories: () => fetchApi('/intents/categories'),
};

// Follows API
export const followsApi = {
  follow: (userId: string) => 
    fetchApi('/follows', { method: 'POST', body: JSON.stringify({ following_id: userId }) }),
  unfollow: (userId: string) => 
    fetchApi(`/follows/${userId}`, { method: 'DELETE' }),
  stats: (userId: string) => fetchApi(`/follows/stats/${userId}`),
  followers: () => fetchApi('/follows/followers'),
  following: () => fetchApi('/follows/following'),
};

// Connections API
export const connectionsApi = {
  list: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return fetchApi(`/connections${params}`);
  },
  pending: () => fetchApi('/connections/pending'),
  request: (data: { addressee_id: string; message?: string; context?: string }) =>
    fetchApi('/connections/request', { method: 'POST', body: JSON.stringify(data) }),
  accept: (id: string) => fetchApi(`/connections/${id}/accept`, { method: 'PUT' }),
  reject: (id: string) => fetchApi(`/connections/${id}/reject`, { method: 'PUT' }),
};

// Cab Shares API
export const cabSharesApi = {
  list: (params?: { origin?: string; destination?: string; date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.origin) searchParams.set('origin', params.origin);
    if (params?.destination) searchParams.set('destination', params.destination);
    if (params?.date) searchParams.set('date', params.date);
    return fetchApi(`/cab-shares?${searchParams}`);
  },
  create: (data: any) => fetchApi('/cab-shares', { method: 'POST', body: JSON.stringify(data) }),
  getMy: () => fetchApi('/cab-shares/my'),
  getById: (id: string) => fetchApi(`/cab-shares/${id}`),
  join: (id: string, data: { seats_needed: number; pickup_point?: string }) =>
    fetchApi(`/cab-shares/${id}/join`, { method: 'POST', body: JSON.stringify(data) }),
};

// Travel Requests API (Vibe Check / Tag Along)
export const travelRequestsApi = {
  // Request to join a travel
  request: (travelId: string, message?: string) =>
    fetchApi('/travel-requests', { 
      method: 'POST', 
      body: JSON.stringify({ travel_id: travelId, message }) 
    }),
  
  // Get requests I've sent
  myRequests: (status?: string) => {
    const params = status ? `?status_filter=${status}` : '';
    return fetchApi(`/travel-requests/my-requests${params}`);
  },
  
  // Get requests for my travels
  received: (status?: string) => {
    const params = status ? `?status_filter=${status}` : '';
    return fetchApi(`/travel-requests/received${params}`);
  },
  
  // Accept a request
  accept: (requestId: string) =>
    fetchApi(`/travel-requests/${requestId}/accept`, { method: 'PUT' }),
  
  // Decline a request
  decline: (requestId: string) =>
    fetchApi(`/travel-requests/${requestId}/decline`, { method: 'PUT' }),
  
  // Cancel my request
  cancel: (requestId: string) =>
    fetchApi(`/travel-requests/${requestId}`, { method: 'DELETE' }),
};
