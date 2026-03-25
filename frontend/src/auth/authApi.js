const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL || "http://localhost:8080/api/v1/auth";

async function request(path = "", options = {}) {
  const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Authentication request failed.";

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export function registerUser(data) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function loginUser(data) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
