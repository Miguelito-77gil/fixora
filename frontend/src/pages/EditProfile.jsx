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
} from "@/services/repairerService";

const CATEGORIES = [
  "Electronics",
  "Appliances",
  "Plumbing",
  "Electrical",
  "Automotive",
  "Furniture",
];

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

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
  const [originalRepairerProfile, setOriginalRepairerProfile] = useState(null);

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
  const [success, setSuccess] = useState("");

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

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
          const repairerData =
            await fetchMyRepairerProfile();

             setOriginalRepairerProfile(repairerData);

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
            Number(repairerData?.available) === 1
          );

          setPhotoUrl(
            resolveMediaUrl(
              repairerData?.profile?.photo_url ||
                repairerData?.profile?.photo ||
                repairerData?.profile?.profile_photo ||
                ""
            )
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

      setSuccess(
        "Profile photo updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
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

  async function handleSubmit(e) {
    e.preventDefault();

    console.log("SAVE BUTTON CLICKED");

    setError("");
    setSuccess("");

    if (isRepairer) {
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

        const originalCategory =
          originalRepairerProfile?.category || "";

        const originalBio =
          originalRepairerProfile?.bio || "";

        const originalYears =
          originalRepairerProfile?.years_experience == null
            ? null
            : Number(originalRepairerProfile.years_experience);

        const originalLocation =
          originalRepairerProfile?.location || "";

        const originalPrice =
          originalRepairerProfile?.price == null
            ? null
            : Number(originalRepairerProfile.price);

        const originalPhone =
          originalRepairerProfile?.phone ||
          profile?.phone ||
          "";

          const originalAvailable =
            Number(originalRepairerProfile?.available) === 1;
        
          const updates = {};

        if (finalCategory !== originalCategory) {
          updates.category = finalCategory;
        }

        if (bio.trim() !== originalBio) {
          updates.bio = bio.trim();
        }

        const newYears =
          yearsExperience === ""
            ? null
            : Number(yearsExperience);

        if (newYears !== originalYears) {
          updates.years_experience = newYears;
        }

        if (location.trim() !== originalLocation) {
          updates.location = location.trim();
        }

        const newPrice =
          price === ""
            ? null
            : Number(price);

        if (newPrice !== originalPrice) {
          updates.price = newPrice;
        }

        if (phone.trim() !== originalPhone) {
          updates.phone = phone.trim();
        }

        if (available !== originalAvailable) {
          updates.available = available;
        }

        console.log("AVAILABLE:", available);
        console.log("ORIGINAL AVAILABLE:", originalAvailable);
        console.log("UPDATES:", updates);

        if (Object.keys(updates).length > 0) {
          const result = await updateMyRepairerProfile(updates);

          if (result?.profile) {
            setOriginalRepairerProfile(result.profile);
          }
        }
     
} else {
        await updateMyPhone(
          phone.trim()
        );
      }

      setSuccess(
        "Profile updated successfully."
      );

      setTimeout(() => {
        navigate("/repairer/profile");
      }, 1500);
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
    <section className="relative fixora-container py-10 sm:py-14 lg:py-16">
      {success && (
        <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl border border-[#e7e0da] bg-white px-5 py-4 text-sm text-[#17202a] shadow-[0_12px_35px_rgba(47,36,30,0.12)]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5e9e0] text-[#8b5e3c]">
            ✓
          </span>

          <span>{success}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl">
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

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

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
                  >
                    <option value="" disabled>
                      Select a category
                    </option>

                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
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

                {category === "Other" && (
                  <div className="rounded-2xl border border-[#e4ded7] bg-[#faf8f5] p-5 sm:p-6">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#8f796b]">
                      Custom Category
                    </label>

                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) =>
                        setCustomCategory(e.target.value)
                      }
                      placeholder="Example: Computer Repair"
                      maxLength={100}
                      required
                      className="w-full rounded-xl border border-[#dcd0c7] bg-white px-4 py-3 text-sm text-[#2f241e] shadow-sm outline-none transition focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
                    />
                  </div>
                )}

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

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) =>
                      setYearsExperience(e.target.value)
                    }
                    placeholder="Example: 5"
                  />

                  <Input
                    label="Location"
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="Example: Cebu City"
                  />
                </div>

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
                        setAvailable((value) => !value)
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
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default EditProfile;
