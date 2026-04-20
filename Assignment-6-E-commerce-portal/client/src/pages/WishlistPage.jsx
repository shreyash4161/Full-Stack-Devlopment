import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import { api, getErrorMessage } from "../lib/api";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchWishlist = async () => {
      try {
        const { data } = await api.get("/api/wishlist");
        if (!ignore) {
          setItems((data.items || []).map((item) => ({ ...item, isWishlisted: true })));
        }
      } catch (error) {
        if (!ignore) {
          toast.error(getErrorMessage(error, "Unable to load wishlist."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchWishlist();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Wishlist</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">Favorites that deserve a second look</h1>
      <div className="mt-8 masonry-feed">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <ProductSkeleton key={index} />)
          : items.map((item) => <ProductCard key={item._id} listing={item} />)}
      </div>
    </section>
  );
}
