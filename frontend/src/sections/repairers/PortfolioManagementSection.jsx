import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addPortfolioItem,
  fetchMyPortfolio,
  deletePortfolioItem,
} from "@/services/repairerService";

const API_URL = "";

function mediaUrl(path) {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${API_URL}/media/${path.replace("/storage/", "")}`;
  }

  return `${API_URL}${path}`;
}

function PortfolioManagementSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState("");

  async function loadPortfolio() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyPortfolio();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.portfolio)
            ? data.portfolio
            : [];

      setItems(list);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
      setError(
        err.message ||
          "Failed to load your portfolio."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!photo) {
      setError("Please select a photo first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await addPortfolioItem(photo, caption.trim());

      setPhoto(null);
      setCaption("");

      const input = document.getElementById(
        "portfolio-photo"
      );

      if (input) {
        input.value = "";
      }

      await loadPortfolio();

      setSuccess(
        "Portfolio item added successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Failed to add portfolio item:", err);
      setError(
        err.message ||
          "Failed to add portfolio item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this portfolio item?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deletePortfolioItem(id);

      setItems((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      setSuccess(
        "Portfolio item removed successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Failed to delete portfolio item:",
        err
      );

      setError(
        err.message ||
          "Failed to delete portfolio item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="min-h-screen bg-[#f7f3ef] px-5 py-8 text-[#2f241e] sm:px-8 sm:py-12 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-6xl">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Repairer Workspace
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight">
              My Portfolio
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#75675f]">
              Show customers the repair work you have
              completed and the quality of your work.
            </p>
          </div>

          <Link
            to="/repairer/dashboard"
            className="inline-flex w-fit rounded-xl border border-[#ded0c6] bg-white px-4 py-2.5 text-sm font-semibold text-[#75675f] transition hover:bg-[#faf6f2]"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm leading-6 text-red-700">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm leading-6 text-emerald-700">
              {success}
            </p>
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-[#e4d9d0] bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6541]">
              Add Work
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Add a completed repair
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#75675f]">
              Upload a clear photo and optionally describe
              the work shown.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
          >
            <div>
              <label
                htmlFor="portfolio-photo"
                className="text-sm font-semibold"
              >
                Work Photo
              </label>

              <input
                id="portfolio-photo"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setPhoto(
                    event.target.files?.[0] || null
                  )
                }
                className="mt-2 block w-full rounded-xl border border-[#dcd0c7] bg-white px-3 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="portfolio-caption"
                className="text-sm font-semibold"
              >
                Description
              </label>

              <input
                id="portfolio-caption"
                type="text"
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                placeholder="Example: Refrigerator compressor replacement"
                maxLength={255}
                className="mt-2 w-full rounded-xl border border-[#dcd0c7] px-4 py-3 text-sm outline-none focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/15"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Uploading..."
                : "Add to Portfolio"}
            </button>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9825f]">
                Your Work
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Portfolio
              </h2>
            </div>

            {!loading && (
              <p className="text-sm text-[#8b7a70]">
                {items.length}{" "}
                {items.length === 1
                  ? "item"
                  : "items"}
              </p>
            )}
          </div>

          {loading ? (
            <div className="mt-5 rounded-3xl border border-[#e4d9d0] bg-white px-6 py-24 text-center shadow-sm">
              <p className="text-sm text-[#75675f]">
                Loading portfolio...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-24 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#9a6541]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-7 w-7"
                >
                  <rect
                    x="3.5"
                    y="4.5"
                    width="17"
                    height="15"
                    rx="2"
                  />
                  <circle
                    cx="8.5"
                    cy="9"
                    r="1.5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5.5 16 4-4 3 3 2-2 4 4"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No portfolio items yet
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
                Add photos of completed repair work so
                customers can see your experience.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-[#e4d9d0] bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#eee7df]">
                    {item.image_url ? (
                      <img
                        src={mediaUrl(item.image_url)}
                        alt={
                          item.caption ||
                          "Repair work"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#8b7a70]">
                        Image unavailable
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm leading-6 text-[#4f443d]">
                      {item.caption ||
                        "Completed repair work"}
                    </p>

                    <button
                      type="button"
                      disabled={
                        deletingId === item.id
                      }
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletingId === item.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default PortfolioManagementSection;

