const API_URL = "";

export async function fetchRepairers() {
  const response = await fetch(`${API_URL}/api/repairers`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch repairers");
  }

  return data.map((r) => ({
    id: String(r.id),
    name: r.name,
    initials: r.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    category: r.category,
    rating: Number(r.rating || 0),
    reviews: Number(r.reviews || 0),
    repairs: Number(r.repairs || 0),
    experience: r.years_experience || 0,
    location: r.location || "Not specified",
    price: r.price || 0,
    verified: true,
    available: r.available !== 0,
    services: [r.category],
    about: r.bio || "No description provided.",
    photo_url: r.photo_url || null,
  }));
}
export async function fetchRepairerById(id) {
  const all = await fetchRepairers();
  return all.find((r) => r.id === String(id)) || null;
}
export async function fetchMyRepairerProfile() {
  const token = localStorage.getItem("fixora_token");

  const response = await fetch(`${API_URL}/api/repairers/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch your profile");
  }

  return data;
}

export async function uploadMyRepairerPhoto(file) {
  const token = localStorage.getItem("fixora_token");

  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${API_URL}/api/repairers/me/photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload photo");
  }

  return data;
}


export async function addPortfolioItem(file, caption) {
  const token = localStorage.getItem("fixora_token");

  const formData = new FormData();
  formData.append("photo", file);
  if (caption) formData.append("caption", caption);

  const response = await fetch(`${API_URL}/api/repairers/me/portfolio`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add portfolio item");
  }

  return data;
}

export async function fetchMyPortfolio() {
  const token = localStorage.getItem("fixora_token");

  const response = await fetch(`${API_URL}/api/repairers/me/portfolio`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch portfolio");
  }

  return data;
}

export async function deletePortfolioItem(id) {
  const token = localStorage.getItem("fixora_token");

  const response = await fetch(`${API_URL}/api/repairers/me/portfolio/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete portfolio item");
  }

  return data;
}

export async function fetchRepairerPortfolio(id) {
  const response = await fetch(`${API_URL}/api/repairers/${id}/portfolio`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch portfolio");
  }

  return data;
}

export async function updateMyRepairerProfile(profile) {
  const token = localStorage.getItem("fixora_token");

  const response = await fetch(`${API_URL}/api/repairers/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update your profile");
  }

  return data;
}


