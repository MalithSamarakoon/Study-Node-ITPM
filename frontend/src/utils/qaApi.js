import { getToken } from './auth';

const API_BASE_URL = 'http://localhost:8080';

const api = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    ...restOptions
  } = options;

  const token = getToken();

  const defaultHeaders = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...headers,
  };

  const hasBody = body !== null && body !== undefined;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && !defaultHeaders['Content-Type']) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers: defaultHeaders,
    ...restOptions,
  };

  if (hasBody) {
    config.body = isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body));
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        const textError = await response.text();
        if (textError) errorMessage = textError;
      }
      throw new Error(errorMessage);
    }

    // Some endpoints may return no content (e.g., delete)
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.message);
    throw error;
  }
};

export const get = (endpoint, options = {}) =>
  api(endpoint, { method: 'GET', ...options });

export const post = (endpoint, body, options = {}) =>
  api(endpoint, { method: 'POST', body, ...options });

export const put = (endpoint, body, options = {}) =>
  api(endpoint, { method: 'PUT', body, ...options });

export const del = (endpoint, options = {}) =>
  api(endpoint, { method: 'DELETE', ...options });

export const resolveApiUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default { get, post, put, del };
