import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useListings } from "../context/ListingsContext";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Cars", "Mobiles", "Bikes", "Furniture", "Electronics"];

export default function HomePage() {
  const { listings } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") || "All";

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    setSearchParams(params);
  };

  const filtered = useMemo(() => {
    let results = [...listings];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== "All") {
      results = results.filter((item) => item.category === selectedCategory);
    }

    // Price range
    if (priceMin) {
      results = results.filter((item) => item.price >= Number(priceMin));
    }
    if (priceMax) {
      results = results.filter((item) => item.price <= Number(priceMax));
    }

    return results;
  }, [listings, searchQuery, selectedCategory, priceMin, priceMax]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" id="category-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              selectedCategory === cat
                ? "bg-[#002f34] text-white border-[#002f34]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#002f34] hover:text-[#002f34]"
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            showFilters
              ? "bg-[#23e5db] text-[#002f34] border-[#23e5db]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#002f34]"
          }`}
          id="filter-toggle"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Search Active Indicator */}
      {searchQuery && (
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
          <Search className="w-4 h-4" />
          <span>
            Results for "<strong>{searchQuery}</strong>" — {filtered.length} found
          </span>
          <button
            onClick={clearSearch}
            className="ml-1 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}

      {/* Price Filters Panel */}
      {showFilters && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg" id="filter-panel">
          <p className="text-sm font-semibold text-[#002f34] mb-3">Price Range</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#002f34]"
              id="price-min"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#002f34]"
              id="price-max"
            />
            {(priceMin || priceMax) && (
              <button
                onClick={() => { setPriceMin(""); setPriceMax(""); }}
                className="text-xs text-red-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#002f34]">
          {selectedCategory === "All" ? "Fresh recommendations" : selectedCategory}
        </h2>
        <span className="text-sm text-gray-500">{filtered.length} ads</span>
      </div>

      {/* Listings Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" id="listings-grid">
          {filtered.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16" id="no-results">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700">No results found</p>
          <p className="text-sm text-gray-500 mt-1.5">
            Try changing your search term or remove filters
          </p>
        </div>
      )}
    </div>
  );
}
