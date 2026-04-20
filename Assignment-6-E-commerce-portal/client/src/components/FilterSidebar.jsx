import { Search, SlidersHorizontal } from "lucide-react";

const categories = ["", "Cars", "Bikes", "Electronics", "Furniture", "Others"];
const conditions = ["", "New", "Like New", "Used"];
const sorts = [
  { value: "latest", label: "Latest" },
  { value: "priceAsc", label: "Price low to high" },
  { value: "priceDesc", label: "Price high to low" },
  { value: "popular", label: "Popular" }
];

export default function FilterSidebar({ filters, onChange, locationSuggestions }) {
  return (
    <aside className="sticky top-24 h-fit rounded-[30px] border border-white/50 bg-white/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">Refine feed</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Smart filters</h2>
        </div>
        <div className="rounded-full border border-teal-500/20 bg-teal-500/10 p-3 text-teal-600">
          <SlidersHorizontal className="size-4" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Search</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
            <Search className="size-4 text-slate-400" />
            <input
              value={filters.q}
              onChange={(event) => onChange("q", event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Laptops, bikes, chairs..."
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Category</span>
          <select
            value={filters.category}
            onChange={(event) => onChange("category", event.target.value)}
            className="field-base"
          >
            {categories.map((category) => (
              <option key={category || "all"} value={category}>
                {category || "All categories"}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Condition</span>
          <select
            value={filters.condition}
            onChange={(event) => onChange("condition", event.target.value)}
            className="field-base"
          >
            {conditions.map((condition) => (
              <option key={condition || "any"} value={condition}>
                {condition || "Any condition"}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Location</span>
          <input
            list="location-suggestions"
            value={filters.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="Pune, Mumbai, Bengaluru..."
            className="field-base"
          />
          <datalist id="location-suggestions">
            {locationSuggestions.map((item) => (
              <option key={item.city} value={item.city}>
                {item.city}
              </option>
            ))}
          </datalist>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Min</span>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
              className="field-base"
              placeholder="0"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Max</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
              className="field-base"
              placeholder="500000"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Sort by</span>
          <select
            value={filters.sort}
            onChange={(event) => onChange("sort", event.target.value)}
            className="field-base"
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  );
}
