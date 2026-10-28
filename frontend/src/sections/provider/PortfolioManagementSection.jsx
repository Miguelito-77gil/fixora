import { useEffect, useState } from "react";
import {
  fetchMyPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} from "@/services/repairerService";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function resolveMediaUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function PortfolioManagementSection() {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPortfolio() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyPortfolio();

      setPortfolio(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select an image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await addPortfolioItem(selectedFile, caption);

      setSelectedFile(null);
      setCaption("");

      const input = document.getElementById("portfolio-image");

      if (input) {
        input.value = "";
      }

      setSuccess("Portfolio image uploaded successfully.");

      await loadPortfolio();
    } catch (err) {
      setError(err.message || "Failed to upload portfolio image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this portfolio image?")) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deletePortfolioItem(id);

      setPortfolio((items) =>
        items.filter((item) => item.id !== id)
      );

      setSuccess("Portfolio image deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete portfolio image.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="min-h-screen bg-[#f7f3ef] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2f241e]">
            Portfolio
          </h1>

          <p className="mt-2 text-[#75675f]">
            Showcase your previous repair work.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-[#e7e0da] bg-[#f5e9e0] px-4 py-3 text-sm text-[#5f5751]">
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-[#e7e0da] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#2f241e]">
              Add Portfolio
            </h2>

            <form onSubmit={handleUpload} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="portfolio-image"
                  className="mb-2 block text-sm font-medium text-[#5f5751]"
                >
                  Repair Image
                </label>

                <input
                  id="portfolio-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full rounded-xl border border-[#e7e0da] bg-[#f7f3ef] px-3 py-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="portfolio-caption"
                  className="mb-2 block text-sm font-medium text-[#5f5751]"
                >
                  Caption
                </label>

                <textarea
                  id="portfolio-caption"
                  value={caption}
                  onChange={(event) =>
                    setCaption(event.target.value)
                  }
                  placeholder="Example: Motorcycle engine repair"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#e7e0da] bg-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-[#b9825f] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            </form>
          </div>

          <div>
            <h2 className="mb-5 text-xl font-semibold text-[#2f241e]">
              My Portfolio
            </h2>

            {loading ? (
              <div className="rounded-2xl border border-[#e7e0da] bg-white p-10 text-center text-[#75675f]">
                Loading portfolio...
              </div>
            ) : portfolio.length === 0 ? (
              <div className="rounded-2xl border border-[#e7e0da] bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-[#2f241e]">
                  No portfolio yet
                </h3>

                <p className="mt-2 text-sm text-[#75675f]">
                  Upload photos of your previous repair work.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {portfolio.map((item) => {
                  const imageUrl = resolveMediaUrl(item.photo_url);

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-[#e7e0da] bg-white"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[#f7f3ef]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.caption || "Portfolio"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[#8a817b]">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="text-sm text-[#75675f]">
                          {item.caption || "Repair project"}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="mt-5 w-full rounded-xl border border-[#e7e0da] px-4 py-2.5 text-sm font-medium text-[#5f5751] disabled:opacity-60"
                        >
                          {deletingId === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PortfolioManagementSection;