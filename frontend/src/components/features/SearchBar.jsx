function SearchBar({
  search,
  setSearch,
  location,
  setLocation,
  onSearch,
}) {
  return (
    <div className="rounded-2xl border border-[#e4ded7] bg-white p-3 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <div className="flex items-center rounded-xl border border-[#e0dad3] bg-white px-4">
          <span className="mr-3 text-[#8b9196]">Search</span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            placeholder="What needs fixing?"
            className="w-full py-3 text-sm text-[#26313b] outline-none placeholder:text-[#a1a5a8]"
          />
        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border border-[#e0dad3] bg-white px-4 py-3 text-sm text-[#26313b] outline-none focus:border-[#b9825f]"
        >
          <option value="All Locations">All Locations</option>
          <option value="Cebu City">Cebu City</option>
          <option value="Mandaue City">Mandaue City</option>
          <option value="Lapu-Lapu City">Lapu-Lapu City</option>
          <option value="Talisay City">Talisay City</option>
        </select>

        <button
          onClick={onSearch}
          className="rounded-xl bg-[#b9825f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
