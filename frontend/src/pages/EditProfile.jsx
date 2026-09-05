import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyRepairerProfile,
  updateMyRepairerProfile,
  uploadMyRepairerPhoto,
  fetchMyPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
} from "@/services/repairerService";

const CATEGORIES = [
  "Electronics",
  "Appliances",
  "Plumbing",
  "Electrical",
  "Automotive",
  "Furniture",
  "Other",
];

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [portfolio, setPortfolio] = useState([]);
  const [portfolioCaption, setPortfolioCaption] = useState("");
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "repairer" && user.role !== "admin")) {
      return;
    }

    fetchMyRepairerProfile()
      .then((data) => {
        setCategory(data.category || "");
        setBio(data.bio || "");
        setYearsExperience(data.years_experience ?? "");
        setLocation(data.location || "");
        setPrice(data.price ?? "");
        setPhone(data.phone || "");
        setAvailable(data.available !== 0);
        setPhotoUrl(data.photo_url || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetchMyPortfolio()
      .then(setPortfolio)
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <p className="text-sm text-[#777f86]">
          You must be logged in to view this page.
        </p>
      </section>
    );
  }

  if (user.role !== "repairer" && user.role !== "admin") {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#17202a]">
            No repairer profile
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            You need to be a registered repairer to edit a profile.
          </p>
        </div>
      </section>
    );
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setPhotoUploading(true);

    try {
      const result = await uploadMyRepairerPhoto(file);
      setPhotoUrl(result.photo_url);
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handlePortfolioUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPortfolioError("");
    setPortfolioUploading(true);

    try {
      const item = await addPortfolioItem(file, portfolioCaption);
      setPortfolio((prev) => [item, ...prev]);
      setPortfolioCaption("");
    } catch (err) {
      setPortfolioError(err.message);
    } finally {
      setPortfolioUploading(false);
      e.target.value = "";
    }
  }

  async function handlePortfolioDelete(id) {
    try {
      await deletePortfolioItem(id);
      setPortfolio((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setPortfolioError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSuccess(false);

    try {
      await updateMyRepairerProfile({
        category,
        bio,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
        location,
        price: price ? Number(price) : null,
        phone,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <p className="text-sm text-[#777f86]">Loading...</p>
      </section>
    );
  }

  return (
    <section className="fixora-container flex min-h-[680px] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Manage your listing
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#17202a]">
            Edit Profile
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            Update your information. Changes are visible immediately.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          {photoUrl ? (
            <img
              src={`http://localhost:5000${photoUrl}`}
              alt="Profile"
              className="h-24 w-24 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f1e6da] text-lg font-bold text-[#b9825f]">
              No photo
            </div>
          )}

          <label className="cursor-pointer rounded-lg border border-[#b9825f] px-4 py-2 text-sm font-semibold text-[#b9825f] transition hover:bg-[#b9825f] hover:text-white">
            {photoUploading ? "Uploading..." : "Change photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={photoUploading}
              className="hidden"
            />
          </label>

          {photoError && (
            <p className="text-xs text-red-600">{photoError}</p>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#26313b]">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-2.5 text-sm text-[#26313b] focus:border-[#b9825f] focus:outline-none"
            >
              <option value="" disabled>
                Select a category
              </option>

              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#26313b]">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Describe your experience and the type of repairs you handle"
              className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-2.5 text-sm text-[#26313b] focus:border-[#b9825f] focus:outline-none"
            />
          </div>

          <Input
            label="Years of experience"
            type="number"
            min="0"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          />

          <Input
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <Input
            label="Starting price (PHP)"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <Input
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="rounded-xl border border-[#e4ded7] bg-[#faf8f5] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#26313b]">
                  Availability
                </p>

                <p className="mt-1 text-xs text-[#777f86]">
                  {available
                    ? "Customers can see that you are currently accepting jobs."
                    : "Customers will see that you are currently unavailable."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAvailable((value) => !value)}
                disabled={saving}
                aria-pressed={available}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  available ? "bg-[#b9825f]" : "bg-[#b8b2ac]"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    available ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <p
              className={`mt-3 text-xs font-semibold ${
                available ? "text-green-700" : "text-[#777f86]"
              }`}
            >
              {available ? "Available now" : "Currently unavailable"}
            </p>
          </div>
          

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </form>

        <div className="mt-10 border-t border-[#e4ded7] pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Portfolio
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#17202a]">
            Past work
          </h2>

          <p className="mt-2 text-sm text-[#777f86]">
            Add photos of jobs you have completed.
          </p>

          {portfolioError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {portfolioError}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {portfolio.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-[#e4ded7]">
                <img
                  src={`http://localhost:5000${item.image_url}`}
                  alt={item.caption || "Portfolio item"}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handlePortfolioDelete(item.id)}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-red-600 opacity-0 transition group-hover:opacity-100"
                >
                  Delete
                </button>

                {item.caption && (
                  <p className="truncate bg-white px-2 py-1.5 text-xs text-[#505961]">
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <input
              type="text"
              value={portfolioCaption}
              onChange={(e) => setPortfolioCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-2.5 text-sm text-[#26313b] focus:border-[#b9825f] focus:outline-none"
            />

            <label className="inline-flex cursor-pointer rounded-lg border border-[#b9825f] px-4 py-2.5 text-sm font-semibold text-[#b9825f] transition hover:bg-[#b9825f] hover:text-white">
              {portfolioUploading ? "Uploading..." : "Add photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePortfolioUpload}
                disabled={portfolioUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditProfile;