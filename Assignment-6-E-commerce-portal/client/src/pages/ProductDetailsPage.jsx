import { Heart, MapPin, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";
import { formatCurrency, timeAgo } from "../lib/utils";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/api/listings/${slug}`);
        if (!ignore) {
          setData(data);
          setActiveImage(data.listing.images?.[0] || "/images/fallback-marketplace.svg");
        }
      } catch (error) {
        if (!ignore) {
          toast.error(getErrorMessage(error, "Unable to load listing details."));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchListing();
    return () => {
      ignore = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="masonry-feed">
        <ProductSkeleton />
        <ProductSkeleton />
      </div>
    );
  }

  if (!data?.listing) return null;

  const { listing } = data;

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to save items.");
      return;
    }

    try {
      const response = await api.post(`/api/listings/${listing._id}/wishlist`);
      setData((current) => ({ ...current, isWishlisted: response.data.saved }));
      toast.success(response.data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update wishlist."));
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[36px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
          <img src={activeImage} alt={listing.title} className="h-[440px] w-full rounded-[28px] object-cover" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {(listing.images?.length ? listing.images : ["/images/fallback-marketplace.svg"]).map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`overflow-hidden rounded-[20px] border ${
                  activeImage === image ? "border-teal-500" : "border-white/60 dark:border-white/10"
                }`}
              >
                <img src={image} alt={listing.title} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-white/60 bg-white/72 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-200">
              {listing.category}
            </span>
            {listing.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-200">
                <Sparkles className="size-3.5" />
                Featured
              </span>
            ) : null}
          </div>
          <h1 className="mt-5 text-4xl font-semibold text-slate-950 dark:text-white">{listing.title}</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
            {listing.brand || "Pre-owned"} {listing.model || "product"} • {listing.location?.city}
          </p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold text-slate-950 dark:text-white">{formatCurrency(listing.price)}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Suggested price cue {formatCurrency(listing.aiSuggestedPrice || listing.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleWishlist}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-5 py-3 text-sm font-semibold dark:border-white/10 dark:bg-slate-900/70"
            >
              <Heart className={`size-4 ${data.isWishlisted ? "fill-current text-rose-500" : ""}`} />
              {data.isWishlisted ? "Saved" : "Save listing"}
            </button>
          </div>

          <p className="mt-6 text-base leading-8 text-slate-600 dark:text-slate-300">{listing.description}</p>

          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {[
              { label: "Condition", value: listing.condition },
              { label: "Location", value: listing.location?.city },
              { label: "Views", value: listing.viewCount || 0 },
              { label: "Posted", value: timeAgo(listing.createdAt) }
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-[28px] border border-white/70 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-[0.24em] text-teal-600">Seller profile</p>
            <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{listing.seller?.name}</h3>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <MapPin className="size-4" />
              {listing.seller?.city || listing.location?.city}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {listing.seller?.isOnline ? "Online now" : `Last active ${timeAgo(listing.seller?.lastSeenAt || listing.seller?.updatedAt)}`}
            </p>
            <Link
              to={`/messages?listingId=${listing._id}&seller=${listing.seller?._id}`}
              className="mt-4 inline-flex rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Chat with seller
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Similar picks</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Keep browsing</h2>
          </div>
        </div>
        <div className="masonry-feed">
          {(data.similarListings || []).map((item) => (
            <ProductCard key={item._id} listing={item} />
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Reviews</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(data.reviews || []).length ? (
            data.reviews.map((review) => (
              <div key={review._id} className="rounded-[24px] border border-white/70 bg-white/80 p-5 dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{review.buyer?.name || "Buyer"}</p>
                  <div className="inline-flex items-center gap-1 text-amber-500">
                    <Star className="size-4 fill-current" />
                    <span className="text-sm font-semibold">{review.rating}/5</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{review.comment || "No comment added."}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/60 bg-white/65 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
              No reviews yet. Be the first to leave one after chatting with the seller.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
