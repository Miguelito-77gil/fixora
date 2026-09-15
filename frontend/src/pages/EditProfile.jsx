import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyProfile,
  updateMyPhone,
} from "@/services/authService";
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
];

const API_URL = "";

function resolveMediaUrl(url) {
  if (!url) return "";

  const value = String(url).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("/storage/")) {
    return `${API_URL}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${API_URL}/${value}`;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/storage/${value}`;
}

function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isRepairer =
    user?.role === "repairer" ||
    user?.role === "admin";

  const [profile, setProfile] = useState(null);

  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
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

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [portfolio, setPortfolio] = useState([]);
  const [portfolioCaption, setPortfolioCaption] = useState("");
  const [portfolioUploading, setPortfolioUploading] =
    useState(false);
  const [portfolioError, setPortfolioError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const userData = await fetchMyProfile();
        setProfile(userData);

        setPhone(userData?.phone || "");

        if (isRepairer) {
          const [repairerData, portfolioData] =
            await Promise.all([
              fetchMyRepairerProfile(),
              fetchMyPortfolio(),
            ]);

          const savedCategory =
            repairerData?.category || "";

          if (CATEGORIES.includes(savedCategory)) {
            setCategory(savedCategory);
            setCustomCategory("");
          } else if (savedCategory) {
            setCategory("Other");
            setCustomCategory(savedCategory);
          } else {
            setCategory("");
            setCustomCategory("");
          }

          setBio(repairerData?.bio || "");

          setYearsExperience(
            repairerData?.years_experience ?? ""
          );

          setLocation(
            repairerData?.location || ""
          );

          setPrice(
            repairerData?.price ?? ""
          );

          setPhone(
            repairerData?.phone ||
              userData?.phone ||
              ""
          );

          setAvailable(
            repairerData?.available !== 0
          );

          setPhotoUrl(
            resolveMediaUrl(
              repairerData?.profile?.photo_url || repairerData?.profile?.photo || repairerData?.profile?.profile_photo ||
              ""
            )
          );

          setPortfolio(
            Array.isArray(portfolioData)
              ? portfolioData
              : []
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, isRepairer]);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhotoError("");
    setPhotoUploading(true);

    try {
      const result =
        await uploadMyRepairerPhoto(file);

      if (!result?.photo_url) {
        throw new Error(
          "Photo uploaded, but the new photo could not be displayed."
        );
      }

      setPhotoUrl(
        resolveMediaUrl(result.photo_url)
      );
    } catch (err) {
      setPhotoError(
        err?.message ||
          "Unable to upload your photo."
      );
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  }

  async function handlePortfolioUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPortfolioError("");
    setPortfolioUploading(true);

    try {
      const item = await addPortfolioItem(
        file,
        portfolioCaption
      );

      setPortfolio((prev) => [
        item,
        ...prev,
      ]);

      setPortfolioCaption("");
    } catch (err) {
      setPortfolioError(
        err?.message ||
          "Unable to upload portfolio photo."
      );
    } finally {
      setPortfolioUploading(false);
      e.target.value = "";
    }
  }

  async function handlePortfolioDelete(id) {
    try {
      setPortfolioError("");

      await deletePortfolioItem(id);

      setPortfolio((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err) {
      setPortfolioError(
        err?.message ||
          "Unable to delete portfolio photo."
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (isRepairer) {
      if (!category) {
        setError(
          "Please select a repair category."
        );
        return;
      }

      if (
        category === "Other" &&
        !customCategory.trim()
      ) {
        setError(
          "Please enter your repair category."
        );
        return;
      }
    }

    try {
      setSaving(true);

      if (isRepairer) {
        const finalCategory =
          category === "Other"
            ? customCategory.trim()
            : category;

        await updateMyRepairerProfile({
          category: finalCategory,
          bio: bio.trim(),
          years_experience:
            yearsExperience
              ? Number(yearsExperience)
              : null,
          location: location.trim(),
          price: price
            ? Number(price)
            : null,
          phone: phone.trim(),
          available,
        });
      } else {
        await updateMyPhone(
          phone.trim()
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/repairer/profile");
      }, 800);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <p className="text-sm text-[#777f86]">
          You must be logged in to edit your profile.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <p className="text-sm text-[#777f86]">
          Loading profile...
        </p>
      </section>
    );
  }

  return (
    <section className="fixora-container py-10 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-5xl">

        {/* PAGE HEADER */}
        <div className="mb-9 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            {isRepairer
              ? "Repairer Profile"
              : "Account Settings"}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#17202a] sm:text-4xl lg:text-[42px]">
            Edit Profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#75675f]">
            {isRepairer
              ? "Update your repairer information so customers can learn more about you and the services you provide."
              : "Update your account information."}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm leading-6 text-green-700">
            Profile updated successfully.
          </div>
        )}

        {/* CUSTOMER */}
        {!isRepairer ? (
          <div className="rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-[0_12px_40px_rgba(47,36,30,0.06)] sm:p-8 lg:p-9">

            <div className="border-b border-[#eee9e3] pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9825f]">
                Account Information
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#17202a]">
                Your account
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <Input
                label="Full name"
                type="text"
                value={profile?.name || ""}
                disabled
              />

              <Input
                label="Email"
                type="email"
                value={profile?.email || ""}
                disabled
              />

              <Input
                label="Mobile number"
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter your mobile number"
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* PROFILE PHOTO */}
            <div className="rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-[0_12px_40px_rgba(47,36,30,0.06)] sm:p-8 lg:p-9">

              <div className="border-b border-[#eee9e3] pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9825f]">
                  Profile Photo
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#17202a]">
                  Your photo
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#75675f]">
                  Add a clear photo so customers can recognize your repairer profile.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* PHOTO PREVIEW */}
                <div className="shrink-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#90979d]">
                    Current Photo
                  </p>

                  <div className="h-36 w-36 overflow-hidden rounded-2xl bg-[#f1e6da] ring-4 ring-[#faf5f1] shadow-sm sm:h-40 sm:w-40">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Current repairer profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#b9825f]">
                        No photo
                      </div>
                    )}
                  </div>
                </div>

                {/* PHOTO CONTROLS */}
                <div className="min-w-0 flex-1">

                  <p className="text-sm font-bold text-[#2f241e]">
                    {photoUploading
                      ? "Updating your profile photo..."
                      : photoUrl
                        ? "Your current profile photo"
                        : "You don't have a profile photo yet"}
                  </p>

                  <p className="mt-1 max-w-lg text-xs leading-6 text-[#75675f]">
                    Choose a new image to replace your current profile photo. The preview will update after the upload is completed.
                  </p>

                  <label className="mt-4 inline-flex cursor-pointer rounded-xl border border-[#b9825f] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#b9825f] hover:text-white">
                    {photoUploading
                      ? "Uploading..."
                      : photoUrl
                        ? "Change photo"
                        : "Add photo"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={photoUploading}
                      className="hidden"
                    />
                  </label>

                  {photoError && (
                    <p className="mt-2 text-xs text-red-600">
                      {photoError}
                    </p>
                  )}

                </div>
              </div>
            </div>

            {/* REPAIR INFORMATION */}
            <div className="mt-6 rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-[0_12px_40px_rgba(47,36,30,0.06)] sm:p-8 lg:p-9">

              <div className="border-b border-[#eee9e3] pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9825f]">
                  Repair Information
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#17202a]">
                  About your repairer profile
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#75675f]">
                  Keep your information accurate so customers know what you can help them with.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >

                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#8f796b]">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => {
                      const value = e.target.value;

                      setCategory(value);

                      if (value !== "Other") {
                        setCustomCategory("");
                      }
                    }}
                    className="w-full rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm text-[#2f241e] shadow-sm outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>

                    {CATEGORIES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}

                    <option value="Other">
                      Other / Add your own
                    </option>
                  </select>

                  <p className="mt-1.5 text-xs leading-6 text-[#95847a]">
                    Choose the type of repair you specialize in. If it is not listed, add your own category.
                  </p>
                </div>

                {/* CUSTOM CATEGORY */}
                {category === "Other" && (
                  <div className="rounded-2xl border border-[#e4ded7] bg-[#faf8f5] p-5 sm:p-6">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#8f796b]">
                      Custom Category
                    </label>

                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) =>
                        setCustomCategory(
                          e.target.value
                        )
                      }
                      placeholder="Example: Computer Repair"
                      maxLength={100}
                      required
                      className="w-full rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm text-[#2f241e] shadow-sm outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
                    />
                  </div>
                )}

                {/* ABOUT */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#8f796b]">
                    About You
                  </label>

                  <textarea
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value)
                    }
                    rows={5}
                    maxLength={1000}
                    placeholder="Tell customers a little about yourself, your experience, and the type of repairs you handle."
                    className="w-full resize-none rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm leading-6 text-[#2f241e] shadow-sm outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
                  />

                  <div className="mt-1 flex justify-end text-xs text-[#90979d]">
                    {bio.length}/1000
                  </div>
                </div>

                {/* EXPERIENCE + LOCATION */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) =>
                      setYearsExperience(
                        e.target.value
                      )
                    }
                    placeholder="Example: 5"
                  />

                  <Input
                    label="Location"
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    placeholder="Example: Cebu City"
                    required
                  />
                </div>

                {/* PRICE + PHONE */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Starting Price (PHP)"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    placeholder="Example: 500"
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* AVAILABILITY */}
                <div className="rounded-2xl border border-[#e4ded7] bg-[#faf8f5] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-5">

                    <div>
                      <p className="text-sm font-bold text-[#2f241e]">
                        Available for Jobs
                      </p>

                      <p className="mt-1 max-w-md text-xs leading-6 text-[#75675f]">
                        Let customers know whether you are currently accepting repair jobs.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setAvailable(
                          (value) => !value
                        )
                      }
                      disabled={saving}
                      aria-pressed={available}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        available
                          ? "bg-[#b9825f]"
                          : "bg-[#b8b2ac]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                          available
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <p
                    className={`mt-3 text-xs font-semibold ${
                      available
                        ? "text-green-700"
                        : "text-[#777f86]"
                    }`}
                  >
                    {available
                      ? "Available now"
                      : "Currently unavailable"}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 border-t border-[#eee9e3] pt-6 sm:flex-row">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Profile"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate(-1)
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>

            {/* PORTFOLIO */}
            <div className="mt-6 rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-[0_12px_40px_rgba(47,36,30,0.06)] sm:p-8 lg:p-9">

              <div className="border-b border-[#eee9e3] pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9825f]">
                  Portfolio
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#17202a]">
                  Past Work
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#75675f]">
                  Show customers examples of repair jobs you have completed.
                </p>
              </div>

              {portfolioError && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
                  {portfolioError}
                </div>
              )}

              {portfolio.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                  {portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-[#e4ded7] bg-[#faf8f5] shadow-sm"
                    >
                      <img
                        src={resolveMediaUrl(item.image_url)}
                        alt={
                          item.caption ||
                          "Portfolio repair work"
                        }
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handlePortfolioDelete(
                            item.id
                          )
                        }
                        className="absolute right-2 top-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                      >
                        Delete
                      </button>

                      {item.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-xs text-white">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* ADD PHOTO TILE */}
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d7c9bd] bg-[#faf8f5] text-center transition hover:border-[#b9825f] hover:bg-[#f8f1eb]">

                    <span className="text-3xl font-light text-[#b9825f]">
                      +
                    </span>

                    <span className="mt-1 text-xs font-semibold text-[#777f86]">
                      Add photo
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handlePortfolioUpload
                      }
                      disabled={
                        portfolioUploading
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d7c9bd] bg-[#faf8f5] text-center transition hover:border-[#b9825f] hover:bg-[#f8f1eb]">

                    <span className="text-3xl font-light text-[#b9825f]">
                      +
                    </span>

                    <span className="mt-1 text-xs font-semibold text-[#777f86]">
                      Add photo
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handlePortfolioUpload
                      }
                      disabled={
                        portfolioUploading
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* PORTFOLIO CAPTION */}
              <div className="mt-6 rounded-xl border border-[#e4ded7] bg-[#faf8f5] p-5">

                <p className="text-sm font-bold text-[#2f241e]">
                  Add Portfolio Photo
                </p>

                <p className="mt-1 text-xs leading-6 text-[#75675f]">
                  Add an optional caption before uploading your next work photo.
                </p>

                <input
                  type="text"
                  value={portfolioCaption}
                  onChange={(e) =>
                    setPortfolioCaption(
                      e.target.value
                    )
                  }
                  placeholder="Example: Laptop motherboard repair"
                  className="mt-4 w-full rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm text-[#2f241e] shadow-sm outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
                />

                <label className="mt-3 inline-flex cursor-pointer rounded-xl border border-[#b9825f] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#b9825f] hover:text-white">

                  {portfolioUploading
                    ? "Uploading..."
                    : "Choose Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handlePortfolioUpload
                    }
                    disabled={
                      portfolioUploading
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default EditProfile;





