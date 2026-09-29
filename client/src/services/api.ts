const API_BASE = '/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return response;
  },

  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => api.request('/auth/me'),
  },

  chats: {
    getAll: () => api.request('/chats'),
    create: () => api.request('/chats', { method: 'POST' }),
    getOne: (id: string) => api.request(`/chats/${id}`),
    delete: (id: string) => api.request(`/chats/${id}`, { method: 'DELETE' }),
    getMessages: (id: string) => api.request(`/chats/${id}/messages`),
    sendMessage: (id: string, content: string) =>
      api.request(`/chats/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },
};
