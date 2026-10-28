import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

const API_BASE = `${API_URL}/api`;

function resolvePhotoUrl(photoUrl) {
  if (!photoUrl) return null;

  if (
    photoUrl.startsWith("http://") ||
    photoUrl.startsWith("https://")
  ) {
    return photoUrl;
  }

  if (photoUrl.startsWith("/storage/")) {
    return `${API_URL}${photoUrl}`;
  }

  if (photoUrl.startsWith("storage/")) {
    return `${API_URL}/${photoUrl}`;
  }

  if (photoUrl.startsWith("/")) {
    return `${API_URL}${photoUrl}`;
  }

  return `${API_URL}/storage/${photoUrl}`;
}

function RepairerProfileSection() {
  const { user } = useAuth();
  const { id, slug } = useParams();

  const repairerId = id ?? slug;

  const [repairer, setRepairer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnRepairerProfile =
    user?.role === "repairer" &&
    repairer &&
    String(repairer.id) === String(user.id);

  useEffect(() => {
    let mounted = true;

    async function loadRepairer() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/repairers`);

        const text = await response.text();

        if (!response.ok) {
          throw new Error(`Failed to load repairers: ${response.status}`);
        }

        let result;

        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Backend returned invalid JSON.");
        }

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : [];

        const found = list.find(
          (item) => String(item.id) === String(repairerId)
        );

        if (!found) {
          throw new Error(`Repairer ${repairerId} not found.`);
        }

        if (mounted) {
          setRepairer(found);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load repairer profile.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (repairerId) {
      loadRepairer();
    } else {
      setLoading(false);
      setError("Repairer ID is missing.");
    }

    return () => {
      mounted = false;
    };
  }, [repairerId]);

  if (loading) {
    return (
      <section className="bg-[#f7f7f5] px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#e5dfd8] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#667085]">
              Loading repairer profile...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !repairer) {
    return (
      <section className="bg-[#f7f7f5] px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#e5dfd8] bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-[#17202a]">
              Repairer not found
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              {error}
            </p>

            <Link
              to="/repairers"
              className="mt-6 inline-flex rounded-xl bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f0e2d7]"
            >
              Back to Repairers
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const accountNumber =
    repairer.id ??
    repairer.user_id ??
    repairer.account_number ??
    "Not available";

  const name = repairer.name || "Repairer";
  const email = repairer.email || "Not provided";
  const phone = repairer.phone || "Not provided";

  const category =
    repairer.category ||
    repairer.specialization ||
    "General Repair";

  const location = repairer.location || "Not specified";

  const experience =
    repairer.years_experience !== undefined &&
    repairer.years_experience !== null
      ? `${repairer.years_experience}+`
      : repairer.experience || "0";

  const completedRepairs =
    repairer.repairs ??
    repairer.completed_repairs ??
    0;

  const rating = repairer.rating ?? 0;
  const reviews = repairer.reviews ?? 0;

  const about =
    repairer.bio ||
    repairer.about ||
    "No description provided.";

  const price = repairer.price ?? 0;

  const photoUrl = resolvePhotoUrl(
    repairer.photo_url ||
      repairer.photo ||
      repairer.profile_photo
  );

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="bg-[#f7f7f5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="overflow-hidden rounded-2xl border border-[#e5dfd8] bg-white shadow-sm">
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-2 ring-[#f0ebe6]"
                    onError={(event) => {
                      const image = event.currentTarget;

                      if (!image.dataset.fallback) {
                        image.dataset.fallback = "true";

                        const rawPhoto =
                          repairer.photo_url ||
                          repairer.photo ||
                          repairer.profile_photo;

                        if (rawPhoto) {
                          const cleanPath = String(rawPhoto).replace(
                            /^\/+/,
                            ""
                          );

                          image.src = cleanPath.startsWith("storage/")
                            ? `${API_URL}/${cleanPath}`
                            : `${API_URL}/storage/${cleanPath}`;

                          return;
                        }
                      }

                      image.style.display = "none";

                      const fallback =
                        image.parentElement?.querySelector(
                          "[data-photo-fallback]"
                        );

                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                  />
                ) : null}

                <div
                  data-photo-fallback
                  className={`h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#eee7e1] text-2xl font-semibold text-[#8b6046] ${
                    photoUrl ? "hidden" : "flex"
                  }`}
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold text-[#17202a]">
                      {name}
                    </h1>

                    {repairer.verification_status === "verified" && (
                      <span className="rounded-full border border-[#e5dfd8] bg-[#f7f2ee] px-2.5 py-1 text-xs font-medium text-[#75675f]">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-[#8b6046]">
                    {category}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#667085]">
                    <span>{location}</span>

                    <span>
                      {repairer.available
                        ? "Available now"
                        : "Currently unavailable"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="font-medium text-[#17202a]">
                      {rating}
                    </span>

                    <span className="text-[#8b6046]">
                      rating
                    </span>

                    <span className="text-[#98a2b3]">
                      ({reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {!isOwnRepairerProfile && (
                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <Link
                    to={`/repairer/${repairer.id}/request`}
                    className="inline-flex items-center justify-center rounded-xl bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f0e2d7]"
                  >
                    Request Repairer
                  </Link>

                  <Link
                    to={`/customer/messages/${repairer.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-[#dccfc5] bg-white px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#faf8f6]"
                  >
                    Message Repairer
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 border-t border-[#eee8e2] sm:grid-cols-3">
            <div className="border-b border-[#eee8e2] p-5 text-center sm:border-b-0 sm:border-r">
              <p className="text-xl font-semibold text-[#17202a]">
                {experience}
              </p>

              <p className="mt-1 text-xs text-[#667085]">
                Years experience
              </p>
            </div>

            <div className="border-b border-[#eee8e2] p-5 text-center sm:border-b-0 sm:border-r">
              <p className="text-xl font-semibold text-[#17202a]">
                {completedRepairs}
              </p>

              <p className="mt-1 text-xs text-[#667085]">
                Completed repairs
              </p>
            </div>

            <div className="p-5 text-center">
              <p className="text-xl font-semibold text-[#17202a]">
                {rating}
              </p>

              <p className="mt-1 text-xs text-[#667085]">
                Average rating
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e5dfd8] bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b6046]">
              About
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
              About {name}
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#667085]">
              {about}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#eee8e2] pt-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[#667085]">
                  Location
                </p>

                <p className="mt-1 text-sm font-semibold text-[#17202a]">
                  {location}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#667085]">
                  Experience
                </p>

                <p className="mt-1 text-sm font-semibold text-[#17202a]">
                  {experience} years
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5dfd8] bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b6046]">
              Services
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
              What I repair
            </h2>

            <div className="mt-5">
              <div className="rounded-xl border border-[#eee8e2] bg-[#faf8f6] p-4">
                <p className="text-sm font-semibold text-[#17202a]">
                  {category}
                </p>

                <p className="mt-1 text-xs text-[#667085]">
                  No specific services listed yet.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e5dfd8] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-[#667085]">
                Starting price
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#17202a]">
                PHP {Number(price).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#667085]">
                Rating
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#17202a]">
                {rating}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#667085]">
                Reviews
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#17202a]">
                {reviews}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e5dfd8] bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b6046]">
            Account
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
            Account information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#eee8e2] bg-[#faf8f6] p-4">
              <p className="text-xs text-[#667085]">
                Account Number
              </p>

              <p className="mt-2 text-sm font-semibold text-[#17202a]">
                {accountNumber}
              </p>

              <p className="mt-1 text-xs text-[#98a2b3]">
                Unique Fixora account number
              </p>
            </div>

            <div className="rounded-xl border border-[#eee8e2] bg-[#faf8f6] p-4">
              <p className="text-xs text-[#667085]">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-[#17202a]">
                {email}
              </p>

              <p className="mt-1 text-xs text-[#98a2b3]">
                Repairer contact email
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e5dfd8] bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8b6046]">
            Contact
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
            Get in touch
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#eee8e2] bg-[#faf8f6] p-4">
              <p className="text-xs text-[#667085]">
                Phone
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-[#17202a]">
                {phone}
              </p>
            </div>

            <div className="rounded-xl border border-[#eee8e2] bg-[#faf8f6] p-4">
              <p className="text-xs text-[#667085]">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-[#17202a]">
                {email}
              </p>
            </div>
          </div>
        </div>

        <div className="pb-6">
          <Link
            to="/repairers"
            className="text-sm font-semibold text-[#8b6046] hover:underline"
          >
            Back to Find a Repairer
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RepairerProfileSection;