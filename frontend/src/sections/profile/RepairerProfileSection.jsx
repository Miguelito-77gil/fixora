import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchRepairerById,
  fetchRepairerPortfolio,
} from "@/services/repairerService";
import {
  toggleFavorite,
  fetchFavorites,
  trackRecentlyViewed,
  fetchRepairerServices,
} from "@/services/marketplaceService";

const API_URL = "http://127.0.0.1:8000";

function mediaUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${API_URL}/media/${path.replace("/storage/", "")}`;
  }

  return `${API_URL}${path}`;
}

function Stat({ value, label }) {
  return (
    <div className="px-4 py-5 text-center">
      <p className="text-xl font-semibold text-[#17202a]">
        {value ?? "â€”"}
      </p>
      <p className="mt-1 text-xs font-medium text-[#90979d]">
        {label}
      </p>
    </div>
  );
}

function RepairerProfileSection() {
  const { slug } = useParams();

  const [repairer, setRepairer] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [serviceLoading, setServiceLoading] = useState(true);

  const [favorited, setFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [error, setError] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setServiceLoading(true);
      setError("");

      try {
        const profile = await fetchRepairerById(slug);

        if (!active) return;

        setRepairer(profile);
        setPhotoFailed(false);

        const repairerId = profile?.id ?? slug;

        try {
          await trackRecentlyViewed(repairerId);
        } catch {
          // Authentication is not required for viewing the profile.
        }

        try {
          const favoriteIds = await fetchFavorites();

          if (Array.isArray(favoriteIds) && active) {
            setFavorited(
              favoriteIds.map(Number).includes(Number(repairerId))
            );
          }
        } catch {
          // Favorites require authentication.
        }

        try {
          const serviceData = await fetchRepairerServices(repairerId);

          if (active) {
            setServices(Array.isArray(serviceData) ? serviceData : []);
          }
        } catch {
          if (active) {
            setServices([]);
          }
        } finally {
          if (active) {
            setServiceLoading(false);
          }
        }

        try {
          const portfolioData = await fetchRepairerPortfolio(repairerId);

          if (active) {
            setPortfolio(
              Array.isArray(portfolioData) ? portfolioData : []
            );
          }
        } catch {
          if (active) {
            setPortfolio([]);
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load repairer profile.");
          setRepairer(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [slug]);

  async function handleFavorite() {
    if (!repairer?.id || favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      const result = await toggleFavorite(repairer.id);
      setFavorited(Boolean(result?.favorited));
    } catch (err) {
      setError(err.message || "Please log in to use favorites.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  const repairerId = repairer?.id;

  const displayServices = useMemo(() => {
    if (services.length > 0) return services;

    if (Array.isArray(repairer?.services)) {
      return repairer.services;
    }

    return [];
  }, [services, repairer]);

  const initials =
    repairer?.initials ||
    repairer?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "RP";

  const rating =
    repairer?.rating !== undefined &&
    repairer?.rating !== null &&
    repairer?.rating !== ""
      ? repairer.rating
      : "â€”";

  const reviews =
    repairer?.reviews !== undefined &&
    repairer?.reviews !== null
      ? repairer.reviews
      : 0;

  const experience =
    repairer?.experience !== undefined &&
    repairer?.experience !== null &&
    repairer?.experience !== ""
      ? `${repairer.experience}+`
      : "â€”";

  const repairs =
    repairer?.repairs !== undefined &&
    repairer?.repairs !== null &&
    repairer?.repairs !== ""
      ? repairer.repairs
      : "â€”";

  const price =
    repairer?.price !== undefined &&
    repairer?.price !== null &&
    repairer?.price !== ""
      ? repairer.price
      : null;

  if (loading) {
    return (
      <section className="fixora-container py-20">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-4 w-32 rounded bg-[#eee9e3]" />

          <div className="mt-5 rounded-3xl border border-[#e4ded7] bg-white p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-24 w-24 rounded-2xl bg-[#eee9e3]" />

              <div className="flex-1">
                <div className="h-7 w-56 rounded bg-[#eee9e3]" />
                <div className="mt-3 h-4 w-32 rounded bg-[#eee9e3]" />
                <div className="mt-2 h-4 w-40 rounded bg-[#eee9e3]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!repairer) {
    return (
      <section className="fixora-container py-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#e4ded7] bg-white p-10 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9825f]">
            Fixora
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-[#17202a]">
            Repairer not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777f86]">
            {error ||
              "The repairer profile you are looking for does not exist."}
          </p>

          <Link
            to="/repairers"
            className="mt-6 inline-flex rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e]"
          >
            Back to repairers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="fixora-container py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between gap-4">
          <Link
            to="/repairers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#777f86] transition hover:text-[#b9825f]"
          >
            <span aria-hidden="true">&#8592;</span>
            Back to repairers
          </Link>

          <Link
            to="/edit-profile"
            className="text-sm font-bold text-[#8b5e3c] transition hover:text-[#b9825f]"
          >
            Edit Profile
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PROFILE HERO */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-sm">

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-center gap-5">

                {repairer.photo_url && !photoFailed ? (
                  <img
                    src={mediaUrl(repairer.photo_url)}
                    alt={repairer.name}
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-[#f7eee8] sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#eee7df] text-xl font-semibold text-[#9b806a] ring-4 ring-[#f7eee8] sm:h-28 sm:w-28">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-semibold tracking-tight text-[#17202a] sm:text-3xl">
                      {repairer.name}
                    </h1>

                    {repairer.verified && (
                      <span className="inline-flex items-center rounded-full border border-[#cfe8d8] bg-[#edf7f0] px-2.5 py-1 text-xs font-medium text-[#28734a]">
                        Verified
                      </span>
                    )}

                  </div>

                  <p className="mt-2 text-sm font-medium text-[#b9825f]">
                    {repairer.category || "Repairer"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#777f86]">

                    {repairer.location && (
                      <span>{repairer.location}</span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          repairer.available
                            ? "bg-[#4b9b6b]"
                            : "bg-[#a9a39d]"
                        }`}
                      />
                      {repairer.available
                        ? "Available now"
                        : "Currently unavailable"}
                    </span>

                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">

                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-semibold text-[#b9825f]">
                        &#9733;
                      </span>

                      <span className="text-sm font-medium text-[#26313b]">
                        {rating}
                      </span>

                      <span className="text-sm text-[#90979d]">
                        ({reviews} reviews)
                      </span>
                    </div>

                  </div>

                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">

                <button
                  type="button"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`inline-flex min-w-32 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                    favorited
                      ? "border-[#b9825f] bg-[#b9825f] text-white"
                      : "border-[#d8c8bc] bg-white text-[#8b5e3c] hover:bg-[#f7eee8]"
                  }`}
                >
                  {favoriteLoading
                    ? "Saving..."
                    : favorited
                      ? "Favorited"
                      : "Favorite"}
                </button>

                <Link
                  to={`/messages/${repairerId}`}
                  className="inline-flex min-w-32 items-center justify-center rounded-xl border border-[#d8c8bc] bg-white px-5 py-2.5 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f7eee8]"
                >
                  Message
                </Link>

              </div>

            </div>
          </div>

          {/* STATS */}
          <div className="grid border-t border-[#eee9e3] sm:grid-cols-3">
            <Stat
              value={experience}
              label="Years experience"
            />

            <div className="border-t border-[#eee9e3] sm:border-l sm:border-t-0">
              <Stat
                value={repairs}
                label="Completed repairs"
              />
            </div>

            <div className="border-t border-[#eee9e3] sm:border-l sm:border-t-0">
              <Stat
                value={rating}
                label="Average rating"
              />
            </div>
          </div>

        </div>

        {/* ABOUT + SERVICES */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          {/* ABOUT */}
          <div className="rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9825f]">
              About
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
              About {repairer.name?.split(" ")[0] || "this repairer"}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#777f86]">
              {repairer.about ||
                repairer.bio ||
                "No biography has been added yet."}
            </p>

            <div className="mt-6 grid gap-4 border-t border-[#eee9e3] pt-5 sm:grid-cols-2">

              <div>
                <p className="text-sm font-medium text-[#777f86]">
                  Location
                </p>

                <p className="mt-1 text-sm font-medium text-[#26313b]">
                  {repairer.location || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#777f86]">
                  Experience
                </p>

                <p className="mt-1 text-sm font-medium text-[#26313b]">
                  {experience === "â€”"
                    ? "Not provided"
                    : `${experience} years`}
                </p>
              </div>

            </div>

          </div>

          {/* SERVICES */}
          <div className="rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9825f]">
              Services
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
              What I repair
            </h2>

            {serviceLoading ? (
              <div className="mt-5 space-y-2">
                <div className="h-14 animate-pulse rounded-xl bg-[#faf8f5]" />
                <div className="h-14 animate-pulse rounded-xl bg-[#faf8f5]" />
                <div className="h-14 animate-pulse rounded-xl bg-[#faf8f5]" />
              </div>
            ) : displayServices.length > 0 ? (
              <div className="mt-5 space-y-2">

                {displayServices.map((service, index) => {
                  const isObject =
                    typeof service === "object" &&
                    service !== null;

                  const name = isObject
                    ? service.name
                    : service;

                  const description = isObject
                    ? service.description
                    : "";

                  const servicePrice = isObject
                    ? service.starting_price
                    : null;

                  return (
                    <div
                      key={
                        isObject && service.id
                          ? service.id
                          : `${name}-${index}`
                      }
                      className="rounded-xl border border-[#eee9e3] bg-[#faf8f5] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#26313b]">
                            {name || "Repair service"}
                          </p>

                          {description && (
                            <p className="mt-1 text-xs leading-5 text-[#777f86]">
                              {description}
                            </p>
                          )}
                        </div>

                        {servicePrice !== null &&
                          servicePrice !== undefined &&
                          servicePrice !== "" && (
                            <span className="shrink-0 text-xs font-medium text-[#b9825f]">
                              From PHP {servicePrice}
                            </span>
                          )}

                      </div>
                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#eee9e3] bg-[#faf8f5] p-4">
                <p className="text-sm font-medium text-[#26313b]">
                  {repairer.category || "General repair"}
                </p>

                <p className="mt-1 text-xs text-[#777f86]">
                  Contact this repairer for more information about available services.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* SERVICE INFORMATION */}
        <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

          <div className="grid gap-6 sm:grid-cols-3">

            <div>
              <p className="text-sm font-medium text-[#777f86]">
                Starting price
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#17202a]">
                {price !== null
                  ? `PHP ${price}`
                  : "Contact for price"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#777f86]">
                Rating
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#17202a]">
                {rating}
                <span className="ml-1 text-base text-[#b9825f]">
                  &#9733;
                </span>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#777f86]">
                Reviews
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#17202a]">
                {reviews}
              </p>
            </div>

          </div>

        </div>

        {/* CONTACT */}
        <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9825f]">
            Contact
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
            Get in touch
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div className="rounded-xl border border-[#eee9e3] bg-[#faf8f5] p-4">
              <p className="text-sm font-medium text-[#777f86]">
                Phone
              </p>

              <p className="mt-2 break-words text-sm font-medium text-[#26313b]">
                {repairer.phone || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl border border-[#eee9e3] bg-[#faf8f5] p-4">
              <p className="text-sm font-medium text-[#777f86]">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-medium text-[#26313b]">
                {repairer.email || "Not provided"}
              </p>
            </div>

          </div>

        </div>

        {/* PORTFOLIO */}
        {portfolio.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9825f]">
                  Portfolio
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17202a]">
                  Previous work
                </h2>
              </div>

              <p className="text-xs text-[#90979d]">
                {portfolio.length} portfolio{" "}
                {portfolio.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">

              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-[#e4ded7] bg-[#faf8f5]"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={mediaUrl(item.image_url)}
                      alt={item.caption || "Previous repair work"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  {item.caption && (
                    <p className="px-3 py-2 text-xs leading-5 text-[#505961]">
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}

            </div>

          </div>
        )}

        {/* FINAL ACTIONS */}
        <div className="mt-6 rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row">

            <Link
              to={`/repairer/${repairerId}/request`}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#b9825f] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#a9704e]"
            >
              Request Repair
            </Link>

            <Link
              to={`/messages/${repairerId}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#d8c8bc] bg-white px-6 py-3.5 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f7eee8]"
            >
              Message Repairer
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}

export default RepairerProfileSection;
