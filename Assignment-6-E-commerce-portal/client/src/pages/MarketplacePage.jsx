import { LoaderCircle } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";

function parseFilters(searchParams) {
  return {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "latest"
  };
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => parseFilters(searchParams));
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const deferredQuery = useDeferredValue(filters.q);
  const loadMoreRef = useRef(null);

  const stableFilters = useMemo(
    () => ({
      ...filters,
      q: deferredQuery
    }),
    [deferredQuery, filters]
  );

  useEffect(() => {
    setFilters(parseFilters(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters, setSearchParams]);

  useEffect(() => {
    let ignore = false;

    const fetchListings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/listings", {
          params: {
            ...stableFilters,
            page: 1,
            pageSize: 9
          }
        });

        if (!ignore) {
          startTransition(() => {
            setListings(data.listings || []);
            setPagination(data.pagination);
            setTotal(data.total || 0);
          });
        }
      } catch (error) {
        if (!ignore) {
          toast.error(getErrorMessage(error, "Unable to load listings."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchListings();
    return () => {
      ignore = true;
    };
  }, [stableFilters]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/locations/suggestions", {
          params: { q: filters.city }
        });
        setLocationSuggestions(data.suggestions || []);
      } catch (_error) {
        setLocationSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters.city]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void handleLoadMore();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  });

  const handleLoadMore = async () => {
    if (loadingMore || loading || pagination.page >= pagination.totalPages) {
      return;
    }

    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const { data } = await api.get("/api/listings", {
        params: {
          ...stableFilters,
          page: nextPage,
          pageSize: 9
        }
      });

      startTransition(() => {
        setListings((current) => [...current, ...(data.listings || [])]);
        setPagination(data.pagination);
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load more listings."));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleWishlist = async (listing) => {
    if (!user) {
      toast.error("Please log in to save listings.");
      return;
    }

    try {
      const { data } = await api.post(`/api/listings/${listing._id}/wishlist`);
      setListings((current) =>
        current.map((item) =>
          item._id === listing._id ? { ...item, isWishlisted: data.saved } : item
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update wishlist."));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <FilterSidebar
        filters={filters}
        locationSuggestions={locationSuggestions}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />

      <section className="space-y-6">
        <div className="rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Marketplace feed</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950 dark:text-white md:text-4xl">
                Pinterest-style browsing for pre-owned products
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                Real-time search, sticky filters, lazy-loaded product cards, and premium motion make the feed
                feel polished on mobile, tablet, and desktop.
              </p>
            </div>
            <div className="rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
              {total} listings live
            </div>
          </div>
        </div>

        <div className="masonry-feed">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
            : listings.map((listing) => (
                <ProductCard
                  key={listing._id}
                  listing={listing}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
        </div>

        {!loading && listings.length === 0 ? (
          <div className="rounded-[32px] border border-white/60 bg-white/70 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">No listings matched those filters</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
              Try widening the price range or switching to a different city.
            </p>
          </div>
        ) : null}

        <div ref={loadMoreRef} className="flex justify-center pb-8 pt-2">
          {loadingMore ? (
            <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70">
              <LoaderCircle className="size-4 animate-spin" />
              Loading more
            </div>
          ) : pagination.page < pagination.totalPages ? (
            <button
              type="button"
              onClick={() => void handleLoadMore()}
              className="rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(14,165,233,0.28)]"
            >
              Load more listings
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
