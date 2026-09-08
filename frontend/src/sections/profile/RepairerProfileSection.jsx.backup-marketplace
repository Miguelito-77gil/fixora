import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchRepairerById, fetchRepairerPortfolio } from "@/services/repairerService";

function RepairerProfileSection() {
  const { slug } = useParams();
  const [repairer, setRepairer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    setLoading(true);

    fetchRepairerById(slug)
      .then(setRepairer)
      .finally(() => setLoading(false));

    fetchRepairerPortfolio(slug)
      .then(setPortfolio)
      .catch(() => {});
  }, [slug]);

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
            The repairer profile you are looking for does not exist.
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

        {/* MAIN PROFILE CARD */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-sm">

          {/* HEADER */}
          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">

                {repairer.photo_url ? (
                  <img
                    src={`http://localhost:8000${repairer.photo_url}`}
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

              {repairer.available ? (
                <span className="self-start rounded-lg bg-[#edf7f0] px-3 py-2 text-xs font-semibold text-[#28734a] sm:self-auto">
                  Available now
                </span>
              ) : (
                <span className="self-start rounded-lg bg-[#f3f1ef] px-3 py-2 text-xs font-semibold text-[#777f86] sm:self-auto">
                  Currently busy
                </span>
              )}

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
              {repairer.about}
            </p>

          </div>

          <div className="rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Services
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#17202a]">
              What I repair
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">

              {repairer.services.map((service) => (
                <span
                  key={service}
                  className="rounded-lg bg-[#f3f0ec] px-3 py-2 text-xs font-medium text-[#505961]"
                >
                  {service}
                </span>
              ))}

            </div>

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

          <div className="mt-4 space-y-2 text-sm text-[#505961]">
            <p>
              <span className="font-semibold text-[#26313b]">Phone:</span>{" "}
              {repairer.phone}
            </p>

            <p>
              <span className="font-semibold text-[#26313b]">Email:</span>{" "}
              {repairer.email}
            </p>
          </div>

        </div>

        {/* PRICE */}
        <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
                Service information
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#17202a]">
                Starting price
              </h2>
            </div>

            <p className="text-xl font-medium text-[#17202a]">
              &#8369;{repairer.price}
            </p>

          </div>

        </div>

        {portfolio.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[#e4ded7] bg-white p-6 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Portfolio
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#17202a]">
              Past work
            </h2>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {portfolio.map((item) => (
                <div key={item.id} className="aspect-square overflow-hidden rounded-xl border border-[#e4ded7]">
                  <img
                    src={`http://localhost:8000${item.image_url}`}
                    alt={item.caption || "Portfolio item"}
                    className="h-full w-full object-cover"
                  />

                  {item.caption && (
                    <p className="truncate bg-white px-2 py-1.5 text-xs text-[#505961]">
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* BUTTON */}
        <div className="mt-5 text-center">

          <Link
            to={`/repairer/${repairer.id}/request`}
            className="inline-flex rounded-xl bg-[#b9825f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e]"
          >
            Request Repair
          </Link>

        </div>

      </div>

    </section>
  );
}

export default RepairerProfileSection;
