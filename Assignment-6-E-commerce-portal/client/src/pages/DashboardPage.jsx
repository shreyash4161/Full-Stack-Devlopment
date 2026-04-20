import { Eye, Heart, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";
import { formatCompactNumber, timeAgo } from "../lib/utils";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[26px] border border-white/70 bg-white/82 p-5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.85)] dark:border-white/10 dark:bg-slate-900/60">
      <div className="inline-flex rounded-2xl bg-gradient-to-br from-teal-500/15 to-sky-500/15 p-3 text-teal-700 dark:text-teal-200">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/api/dashboard");
        if (!ignore) {
          setDashboard(data);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(getErrorMessage(error, "Unable to load dashboard."));
        }
      }
    };

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const deleteListing = async (id) => {
    try {
      await api.delete(`/api/listings/${id}`);
      setDashboard((current) => ({
        ...current,
        myListings: current.myListings.filter((item) => item._id !== id)
      }));
      toast.success("Listing deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete listing."));
    }
  };

  const stats = dashboard?.stats || {};

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">Welcome back, {user?.name}</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={Eye} label="Listing views" value={formatCompactNumber(stats.listingViews || 0)} />
          <StatCard icon={Heart} label="Wishlist saves" value={formatCompactNumber(stats.wishlistCount || 0)} />
          <StatCard icon={Eye} label="Active listings" value={formatCompactNumber(stats.totalListings || 0)} />
          <StatCard icon={Eye} label="Inbox conversations" value={formatCompactNumber(stats.inboxCount || 0)} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Your listings</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Manage your feed</h2>
            </div>
            <Link to="/sell" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              Create listing
            </Link>
          </div>
          <div className="masonry-feed">
            {(dashboard?.myListings || []).map((listing) => (
              <ProductCard
                key={listing._id}
                listing={listing}
                manageMode
                actions={
                  <>
                    <Link to={`/sell/${listing._id}/edit`} className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-slate-900/70">
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                    <button type="button" onClick={() => void deleteListing(listing._id)} className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-500">
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Notifications</p>
            <div className="mt-5 space-y-4">
              {(dashboard?.notifications || []).map((notification) => (
                <div key={notification._id} className="rounded-[24px] border border-white/70 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-900/70">
                  <p className="font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{notification.body}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{timeAgo(notification.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
