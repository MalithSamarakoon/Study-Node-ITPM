const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1/teams";

async function request(path = "", options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
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
      payload?.message && typeof payload.message === "string"
        ? payload.message
        : "Request failed. Please try again.";

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getTeams(skill) {
  const query = skill ? `?skill=${encodeURIComponent(skill)}` : "";
  return request(query);
}

export function getTeamById(id) {
  return request(`/${id}`);
}

export function createTeam(data) {
  return request("", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function joinTeam(id, data) {
  return request(`/${id}/join`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getTeamMembers(id) {
  return request(`/${id}/members`);
}

export function approveTeam(id) {
  return request(`/${id}/approve`, {
    method: "PUT",
  });
}

export function rejectTeam(id) {
  return request(`/${id}/reject`, {
    method: "PUT",
  });
}

export function updateTeamStatus(id, status) {
  return request(`/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function approveMembershipRequest(teamId, memberId) {
  return request(`/${teamId}/members/${memberId}/approve`, {
    method: "PUT",
  });
}

export function rejectMembershipRequest(teamId, memberId) {
  return request(`/${teamId}/members/${memberId}/reject`, {
    method: "PUT",
  });
}
