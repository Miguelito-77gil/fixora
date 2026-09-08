import { useEffect, useState } from "react";
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

function RepairerProfileSection() {
  const { slug } = useParams();

  const [repairer, setRepairer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);

  const [services, setServices] = useState([]);

  const [favorited, setFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [serviceLoading, setServiceLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const profile = await fetchRepairerById(slug);

        if (!active) return;

        setRepairer(profile);

        const repairerId = profile?.id ?? slug;

        try {
          await trackRecentlyViewed(repairerId);
        } catch {
          // Recently viewed requires authentication.
        }

        try {
          const favoriteIds = await fetchFavorites();

          if (Array.isArray(favoriteIds)) {
            setFavorited(
              favoriteIds.map(Number).includes(Number(repairerId))
            );
          }
        } catch {
          // Favorites require authentication.
        }

        try {
          const serviceData = await fetchRepairerServices(repairerId);

          if (Array.isArray(serviceData)) {
            setServices(serviceData);
          }
        } catch {
          setServices([]);
        }

        try {
          const portfolioData = await fetchRepairerPortfolio(repairerId);

          if (active) {
            setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
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

  if (loading) {
    return (
      <section className="fixora-container py-20 text-center">
        <p className="text-sm text-[#777f86]">Loading...</p>
      </section>
    );
  }

  if (!repairer) {
    return (
      <section className="fixora-container py-20 text-center">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#e4ded7] bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-[#17202a]">
            Repairer not found
          </h1>

          <p className="mt-3 text-[#777f86]">
            {error ||
              "The repairer profile you are looking for does not exist."}
          </p>

          <Link
            to="/repairers"
            className="mt-6 inline-flex rounded-xl bg-[#b9825f] px-5 py-3 font-semibold text-white"
          >
            Back to repairers
          </Link>
        </div>
      </section>
    );
  }

  const repairerId = repairer.id;

  const displayServices =
    services.length > 0 ? services : repairer.services || [];

  return (
    <section className="fixora-container py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/repairers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#777f86] transition hover:text-[#b9825f]"
        >
          <span>&#8592;</span>
          Back to repairers
        </Link>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN PROFILE CARD */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-sm">

          {/* HEADER */}
          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {repairer.photo_url ? (
                  <img
                    src={`http://127.0.0.1:8000${repairer.photo_url}`}
                    alt={repairer.name}
                    className="h-18 w-18 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-[#eee7df] text-xl font-extrabold text-[#9b806a] sm:h-20 sm:w-20 sm:text-2xl">
                    {repairer.initials}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-extrabold text-[#17202a]">
                      {repairer.name}
                    </h1>

                    {repairer.verified && (
                      <span className="rounded-full bg-[#edf7f0] px-2.5 py-1 text-xs font-bold text-[#28734a]">
                        Verified
                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-sm font-medium text-[#b9825f]">
                    {repairer.category}
                  </p>

                  <p className="mt-1 text-sm text-[#777f86]">
                    {repairer.location}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2">

                {repairer.available ? (
                  <span className="rounded-lg bg-[#edf7f0] px-3 py-2 text-xs font-semibold text-[#28734a]">
                    Available now
                  </span>
                ) : (
                  <span className="rounded-lg bg-[#f3f1ef] px-3 py-2 text-xs font-semibold text-[#777f86]">
                    Currently busy
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
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

              </div>

            </div>

          </div>

          {/* STATS */}
          <div className="grid border-t border-[#eee9e3] sm:grid-cols-3">

            <div className="p-5 text-center">
              <p className="text-xl font-medium text-[#17202a]">
                {repairer.experience}+
              </p>
              <p className="mt-1 text-xs text-[#90979d]">
                Years experience
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-5 text-center sm:border-l sm:border-t-0">
              <p className="text-xl font-medium text-[#17202a]">
                {repairer.repairs}
              </p>
              <p className="mt-1 text-xs text-[#90979d]">
                Completed repairs
              </p>
            </div>

            <div className="border-t border-[#eee9e3] p-5 text-center sm:border-l sm:border-t-0">
              <p className="text-xl font-medium text-[#17202a]">
                &#9733; {repairer.rating}
              </p>
              <p className="mt-1 text-xs text-[#90979d]">
                {repairer.reviews} reviews
              </p>
            </div>

          </div>

        </div>

        {/* ABOUT + SERVICES */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              About
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#17202a]">
              About {repairer.name.split(" ")[0]}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#777f86]">
              {repairer.about || "No biography has been added yet."}
            </p>

          </div>

          <div className="rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Services
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#17202a]">
              What I repair
            </h2>

            {serviceLoading ? (
              <p className="mt-4 text-sm text-[#777f86]">
                Loading services...
              </p>
            ) : displayServices.length > 0 ? (
              <div className="mt-4 space-y-2">

                {displayServices.map((service, index) => {
                  const isObject =
                    typeof service === "object" && service !== null;

                  const name = isObject
                    ? service.name
                    : service;

                  const description = isObject
                    ? service.description
                    : "";

                  const price = isObject
                    ? service.starting_price
                    : null;

                  return (
                    <div
                      key={service.id || `${name}-${index}`}
                      className="rounded-xl border border-[#eee9e3] bg-[#faf8f5] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="text-sm font-semibold text-[#26313b]">
                            {name}
                          </p>

                          {description && (
                            <p className="mt-1 text-xs leading-5 text-[#777f86]">
                              {description}
                            </p>
                          )}
                        </div>

                        {price !== null &&
                          price !== undefined &&
                          price !== "" && (
                            <span className="shrink-0 text-xs font-bold text-[#b9825f]">
                              From &#8369;{price}
                            </span>
                          )}

                      </div>
                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-lg bg-[#f3f0ec] px-3 py-2 text-xs font-medium text-[#505961]">
                  {repairer.category}
                </span>

              </div>
            )}

          </div>

        </div>

        {/* CONTACT */}
        <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
            Contact
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#17202a]">
            Get in touch
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#90979d]">
                Phone
              </p>

              <p className="mt-1 text-sm font-semibold text-[#26313b]">
                {repairer.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#90979d]">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-[#26313b]">
                {repairer.email}
              </p>
            </div>

          </div>

        </div>

        {/* PRICE */}
        <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
                Service information
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#17202a]">
                Starting price
              </h2>
            </div>

            <p className="text-xl font-medium text-[#17202a]">
              &#8369;{repairer.price ?? "Contact for price"}
            </p>

          </div>

        </div>

        {/* PORTFOLIO */}
        {portfolio.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Portfolio
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#17202a]">
              Past work
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">

              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-[#e4ded7] bg-[#faf8f5]"
                >

                  <div className="aspect-square overflow-hidden">
                    <img
                      src={`http://127.0.0.1:8000${item.image_url}`}
                      alt={item.caption || "Portfolio item"}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
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

        {/* ACTIONS */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            to={`/repairer/${repairerId}/request`}
            className="inline-flex items-center justify-center rounded-xl bg-[#b9825f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e]"
          >
            Request Repair
          </Link>

          <Link
            to={`/messages/${repairerId}`}
            className="inline-flex items-center justify-center rounded-xl border border-[#d8c8bc] bg-white px-6 py-3 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f7eee8]"
          >
            Message
          </Link>

        </div>

      </div>
    </section>
  );
}

export default RepairerProfileSection;
