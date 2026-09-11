import { useMemo, useState } from "react";

import RepairerCard from "@/components/features/RepairerCard";
import RepairerFilters from "@/components/features/RepairerFilters";

import { repairers } from "@/services/repairerData";

function FindRepairerSection() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredRepairers = useMemo(() => {
    return repairers.filter((repairer) => {

      const searchableText = [
        repairer.name,
        repairer.specialty,
        repairer.location,
        ...repairer.services,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        searchableText.includes(category.toLowerCase());

      const matchesVerified =
        !verifiedOnly || repairer.verified;

      const matchesAvailable =
        !availableOnly || repairer.available;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesVerified &&
        matchesAvailable
      );
    });
  }, [
    search,
    category,
    verifiedOnly,
    availableOnly,
  ]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">

      {/* HEADER */}
      <div className="max-w-3xl">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
          Find Help
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Find someone who can fix it.
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-400">
          Search experienced local repairers and check their
          skills, previous work, ratings, and verification status
          before contacting them.
        </p>

      </div>

      {/* FILTERS */}
      <div className="mt-10">
        <RepairerFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
        />
      </div>

      {/* RESULTS HEADER */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h2 className="text-xl font-bold">
            Repairers near you
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {filteredRepairers.length}{" "}
            {filteredRepairers.length === 1
              ? "repairer"
              : "repairers"}{" "}
            found
          </p>

        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Verified profiles are reviewed by Fixora
        </div>

      </div>

      {/* RESULTS */}
      {filteredRepairers.length > 0 ? (

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {filteredRepairers.map((repairer) => (
            <RepairerCard
              key={repairer.id}
              repairer={repairer}
            />
          ))}

        </div>

      ) : (

        <div className="mt-6 rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center">

          <div className="text-4xl">
            ðŸ”Ž
          </div>

          <h3 className="mt-5 text-xl font-bold">
            No repairers found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try another search term, category, or remove one
            of the filters.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All");
              setVerifiedOnly(false);
              setAvailableOnly(false);
            }}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            Clear filters
          </button>

        </div>

      )}

    </section>
  );
}

export default FindRepairerSection;
