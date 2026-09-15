import { useEffect, useMemo, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import SearchBar from "@/components/features/SearchBar";
import FilterPanel from "@/components/features/FilterPanel";
import RepairerCard from "@/components/features/RepairerCard";
import { fetchRepairers } from "@/services/repairerService";

function RepairerListSection() {
  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const [location, setLocation] = useState("All Locations");
  const [category, setCategory] = useState("All Categories");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    loadRepairers();
  }, []);

  async function loadRepairers() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchRepairers();
      setRepairers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredRepairers = useMemo(() => {
    let result = [...repairers];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((repairer) => {
        const services = repairer.services || [];

        return (
          repairer.name.toLowerCase().includes(query) ||
          repairer.category.toLowerCase().includes(query) ||
          services.some((item) =>
            item.toLowerCase().includes(query)
          )
        );
      });
    }

    if (location !== "All Locations") {
      result = result.filter((repairer) =>
        repairer.location.startsWith(location)
      );
    }

    if (category !== "All Categories") {
      result = result.filter((repairer) => {
        const services = repairer.services || [];

        return (
          repairer.category === category ||
          services.includes(category)
        );
      });
    }

    if (ratingFilter > 0) {
      result = result.filter(
        (repairer) => repairer.rating >= ratingFilter
      );
    }

    if (availableOnly) {
      result = result.filter(
        (repairer) => repairer.available
      );
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "repairs") {
      result.sort(
        (a, b) => (b.repairs || 0) - (a.repairs || 0)
      );
    }

    if (sort === "experience") {
      result.sort(
        (a, b) => b.experience - a.experience
      );
    }

    return result;
  }, [
    repairers,
    search,
    location,
    category,
    ratingFilter,
    availableOnly,
    sort,
  ]);

  function handleSearch() {
    window.scrollTo({
      top: 500,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10">

        <SectionHeading
          eyebrow="Find a repairer"
          title="Reliable repair services near you."
          description="Search experienced repairers and compare their services, ratings, experience, and previous work."
        />

        <div className="mt-8 sm:mt-10">
          <SearchBar
            search={search}
            setSearch={setSearch}
            location={location}
            setLocation={setLocation}
            onSearch={handleSearch}
          />
        </div>

        <div className="mt-7 grid gap-6 lg:mt-8 lg:grid-cols-[260px_minmax(0,1fr)]">

          <FilterPanel
            category={category}
            setCategory={setCategory}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
          />

          <div className="min-w-0">

            <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="font-semibold text-[#17202a]">
                  {loading ? "Loading..." : `${filteredRepairers.length} repairers found`}
                </h2>

                <p className="mt-1 text-sm text-[#777f86]">
                  Compare providers before requesting a service.
                </p>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-2.5 text-sm text-[#26313b] outline-none focus:border-[#b9825f] sm:w-auto"
              >
                <option value="rating">
                  Highest Ratings
                </option>

                <option value="repairs">
                  Most Completed Repairs
                </option>

                <option value="experience">
                  Most Experience
                </option>
              </select>

            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && filteredRepairers.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">

                {filteredRepairers.map((repairer) => (
                  <RepairerCard
                    key={repairer.id}
                    repairer={{
                      ...repairer,
                      completedRepairs: repairer.repairs,
                      startingPrice: repairer.price,
                      slug: repairer.id,
                      specialties: repairer.services || [],
                    }}
                  />
                ))}

              </div>
            ) : !loading && (
              <div className="rounded-2xl border border-dashed border-[#d8d0c8] bg-white p-8 text-center sm:p-10">
                <h3 className="text-lg font-semibold text-[#26313b]">
                  No repairers found
                </h3>

                <p className="mt-2 text-sm text-[#777f86]">
                  Try changing your search or filters.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

export default RepairerListSection;



