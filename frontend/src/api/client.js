const API_URL = import.meta.env.VITE_API_URL;

// Helper to get the stored JWT token
function getToken() {
  return localStorage.getItem('token');
}

// Generic fetch wrapper that adds the auth header automatically
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export async function login(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function register(username, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getProducts() {
  return apiFetch('/products');
}

export async function getLedger() {
  return apiFetch('/ledger');
}

export async function simulateTransaction() {
  return apiFetch('/simulate', { method: 'POST' });
}

export async function resetData() {
  return apiFetch('/reset', { method: 'POST' });
}