const API_URL = "http://localhost:5000";

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  localStorage.setItem("fixora_token", data.token);
  localStorage.setItem("fixora_user", JSON.stringify(data.user));

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem("fixora_token", data.token);
  localStorage.setItem("fixora_user", JSON.stringify(data.user));

  return data.user;
}

export function getCurrentUser() {
  const storedUser = localStorage.getItem("fixora_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("fixora_user");
    localStorage.removeItem("fixora_token");
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("fixora_token");
}

export function logoutUser() {
  localStorage.removeItem("fixora_user");
  localStorage.removeItem("fixora_token");
}

export async function fetchCurrentUserFromServer() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    logoutUser();
    return null;
  }

  const data = await response.json();
  return data.user;
}

export async function applyAsRepairer({ category, bio, years_experience }) {
  const token = getToken();

  if (!token) {
    throw new Error("You must be logged in to apply");
  }

  const response = await fetch(`${API_URL}/api/repairers/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ category, bio, years_experience }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Application failed");
  }

  return data;
}
export async function fetchMyProfile() {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch profile");
  }

  return data.user || data;
}

export async function updateMyPhone(phone) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update mobile number");
  }

  return data.user || data;
}
