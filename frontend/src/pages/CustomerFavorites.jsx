import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function getToken() {
  return localStorage.getItem("fixora_token");
}

async function fetchFavorites() {
  const response = await fetch(
    `${API_URL}/api/marketplace/favorites`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Backend returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Failed to load favorites (${response.status})`
    );
  }

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.favorites)
      ? data.favorites
      : Array.isArray(data?.data)
        ? data.data
        : [];
}

async function removeFavorite(repairerId) {
  const response = await fetch(
    `${API_URL}/api/marketplace/favorites/${repairerId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Backend returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Failed to update favorite."
    );
  }

  return data;
}

function CustomerFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  async function loadFavorites() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchFavorites();
      setFavorites(data);
    } catch (err) {
      setError(err.message || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(repairerId) {
    try {
      setRemovingId(repairerId);
      setError("");

      await removeFavorite(repairerId);

      setFavorites((current) =>
        current.filter((item) => {
          const repairer =
            item.repairer ||
            item.user ||
            item;

          return String(
            repairer.id ||
              item.repairer_id ||
              item.repairerId
          ) !== String(repairerId);
        })
      );
    } catch (err) {
      setError(
        err.message || "Failed to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  function getRepairer(item) {
    return item.repairer || item.user || item;
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-[#e7e0da] bg-white px-6 py-16 text-center">
          <p className="text-sm text-[#75675f]">
            Loading your favorites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f7f7f5] px-4 py-8 text-[#17202a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#75675f]">
              Saved Repairers
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Favorites
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
              Keep your preferred repairers in one place.
            </p>
          </div>

          <Link
            to="/repairers"
            className="inline-flex w-fit rounded-xl border border-[#e7e0da] bg-white px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
          >
            Find Repairers
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#e7e0da] bg-white px-5 py-4">
            <p className="text-sm text-[#75675f]">
              {error}
            </p>

            <button
              type="button"
              onClick={loadFavorites}
              className="mt-3 rounded-xl border border-[#e7e0da] bg-white px-4 py-2 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
            >
              Try Again
            </button>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#75675f]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25S4.5 15.8 4.5 9.75A4.25 4.25 0 0 1 12 7.3a4.25 4.25 0 0 1 7.5 2.45c0 6.05-7.5 10.5-7.5 10.5Z"
                />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              No favorite repairers yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
              Save repairers you trust so you can find them quickly later.
            </p>

            <Link
              to="/repairers"
              className="mt-5 inline-flex rounded-xl border border-[#e7e0da] bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f7f2ee]"
            >
              Browse Repairers
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => {
              const repairer = getRepairer(item);
              const repairerId =
                repairer.id ||
                item.repairer_id ||
                item.repairerId;

              return (
                <div
                  key={repairerId}
                  className="rounded-3xl border border-[#e7e0da] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {repairer.photo_url ||
                      repairer.photo ? (
                        <img
                          src={
                            repairer.photo_url ||
                            repairer.photo
                          }
                          alt={repairer.name || "Repairer"}
                          className="h-14 w-14 shrink-0 rounded-full border border-[#e7e0da] object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f5e9e0] text-lg font-semibold text-[#75675f]">
                          {repairer.name
                            ?.charAt(0)
                            ?.toUpperCase() || "R"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-[#17202a]">
                          {repairer.name ||
                            "Repairer"}
                        </h2>

                        <p className="mt-1 truncate text-xs text-[#8a817b]">
                          {repairer.category ||
                            repairer.repairer_profile
                              ?.category ||
                            "Repair Service"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(repairerId)
                      }
                      disabled={
                        removingId === repairerId
                      }
                      className="shrink-0 rounded-xl border border-[#e7e0da] bg-white px-3 py-2 text-xs font-semibold text-[#75675f] transition hover:bg-[#f7f2ee] disabled:opacity-60"
                    >
                      {removingId === repairerId
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>

                  <div className="mt-5 border-t border-[#eee7e2] pt-4">
                    <p className="text-sm text-[#75675f]">
                      {repairer.location ||
                        "Location not specified"}
                    </p>

                    <Link
                      to={`/repairer/${repairerId}`}
                      className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#e7e0da] bg-white px-4 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerFavorites;