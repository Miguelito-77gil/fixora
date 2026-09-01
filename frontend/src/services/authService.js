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
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem("fixora_user");
}