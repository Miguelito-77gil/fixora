function RepairerFilters({
  search,
  setSearch,
  category,
  setCategory,
  verifiedOnly,
  setVerifiedOnly,
  availableOnly,
  setAvailableOnly,
}) {
  const categories = [
    "All",
    "Electronics",
    "Appliances",
    "Computer",
    "Motorcycle",
    "Plumbing",
    "Electrical",
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

      {/* SEARCH */}
      <div>
        <label className="text-sm font-semibold text-slate-300">
          What needs fixing?
        </label>

        <div className="relative mt-3">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            ðŸ”Ž
          </span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search repairers, services, or problems..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50"
          />

        </div>
      </div>

      {/* CATEGORY */}
      <div className="mt-5">

        <p className="text-sm font-semibold text-slate-300">
          Category
        </p>

        <div className="mt-3 flex flex-wrap gap-2">

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                category === item
                  ? "bg-white text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

      </div>

      {/* TOGGLES */}
      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">

        <button
          type="button"
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            verifiedOnly
              ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20"
              : "bg-slate-900 text-slate-400"
          }`}
        >
          <span>
            {verifiedOnly ? "âœ“" : "â—‹"}
          </span>

          Verified only
        </button>

        <button
          type="button"
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            availableOnly
              ? "bg-blue-400/10 text-blue-300 ring-1 ring-blue-400/20"
              : "bg-slate-900 text-slate-400"
          }`}
        >
          <span>
            {availableOnly ? "âœ“" : "â—‹"}
          </span>

          Available now
        </button>

      </div>

    </div>
  );
}

export default RepairerFilters;
