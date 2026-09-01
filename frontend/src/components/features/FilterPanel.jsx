import { categories } from "@/services/repairerData";

function FilterPanel({
  category,
  setCategory,
  minRating,
  setMinRating,
  availableOnly,
  setAvailableOnly,
}) {
  return (
    <aside className="rounded-2xl border border-[#e4ded7] bg-white p-5">
      <h3 className="text-lg font-bold text-[#17202a]">
        Filters
      </h3>

      <div className="mt-6">
        <p className="text-sm font-semibold text-[#26313b]">
          Availability
        </p>

        <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-[#68727c]">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="h-4 w-4 accent-[#b9825f]"
          />
          Accepting new customers
        </label>
      </div>

      <div className="mt-7">
        <p className="text-sm font-semibold text-[#26313b]">
          Categories
        </p>

        <div className="mt-3 space-y-3">
          {categories.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#68727c]"
            >
              <input
                type="radio"
                name="category"
                checked={category === item}
                onChange={() => setCategory(item)}
                className="h-4 w-4 accent-[#b9825f]"
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <p className="text-sm font-semibold text-[#26313b]">
          Minimum rating
        </p>

        <div className="mt-3 space-y-3">
          {[
            ["All Ratings", 0],
      ["\u2605 4.5 and above", "4.5"],
      ["\u2605 4.0 and above", "4.0"],
          ].map(([label, value]) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#68727c]"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === value}
                onChange={() => setMinRating(value)}
                className="h-4 w-4 accent-[#b9825f]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FilterPanel;