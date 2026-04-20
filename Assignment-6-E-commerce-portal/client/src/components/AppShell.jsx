import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Sparkles,
  SunMedium
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import FloatingActionButton from "./FloatingActionButton";

function SearchSuggestions({ query, onNavigate }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const { data } = await api.get("/api/search/suggestions", {
          params: { q: query }
        });
        setSuggestions(data.suggestions || []);
      } catch (_error) {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!suggestions.length) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-[24px] border border-white/60 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
      {suggestions.map((item) => (
        <button
          key={item.slug}
          type="button"
          onClick={() => onNavigate(item.slug)}
          className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {item.category}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("resellr-theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("resellr-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/marketplace", label: "Marketplace" },
      { to: "/sell", label: "Sell" },
      ...(user
        ? [
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { to: "/wishlist", label: "Wishlist", icon: Heart },
            { to: "/messages", label: "Messages", icon: MessageSquare }
          ]
        : [])
    ],
    [user]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/marketplace?q=${encodeURIComponent(search.trim())}`);
  };

  const handleSuggestionNavigate = (slug) => {
    setSearch("");
    navigate(`/listing/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_25%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,#f4fbfb_0%,#f8fbff_44%,#eef7ff_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-12%] h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/30 bg-white/60 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <div className="mx-auto flex w-[min(1320px,calc(100vw-24px))] items-center gap-4 py-4">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 via-teal-600 to-sky-500 shadow-[0_18px_48px_rgba(14,165,233,0.28)]">
              <span className="absolute left-2 top-2 size-2 rounded-full bg-white/90" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-teal-200/90" />
              <span className="absolute bottom-2 left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-[4px] bg-white/90" />
            </div>
            <div>
              <p className="text-lg font-semibold">Resellr Nexus</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Smart local marketplace
              </p>
            </div>
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden flex-1 items-center gap-3 rounded-full border border-white/50 bg-white/75 px-4 py-3 shadow-[0_16px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex dark:border-white/10 dark:bg-slate-950/70"
          >
            <Search className="size-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cars, furniture, gadgets, bikes..."
              className="w-full bg-transparent text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              Search
            </button>
            <SearchSuggestions query={search} onNavigate={handleSuggestionNavigate} />
          </form>

          <button
            type="button"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/50 bg-white/75 text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200"
          >
            {theme === "dark" ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/50 bg-white/75 md:hidden dark:border-white/10 dark:bg-slate-950/70"
          >
            <Menu className="size-4" />
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-900/70"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {!user ? (
              <Link
                to="/auth"
                className="rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(14,165,233,0.28)]"
              >
                Join free
              </Link>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/75 px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-slate-950/70"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            )}
          </nav>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/30 bg-white/70 px-3 pb-4 pt-3 md:hidden dark:border-white/10 dark:bg-slate-950/85">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <div className="flex items-center gap-3 rounded-full border border-white/50 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-900/80">
                <Search className="size-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search the marketplace"
                />
              </div>
              <SearchSuggestions query={search} onNavigate={handleSuggestionNavigate} />
            </form>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "bg-white/75 dark:bg-slate-900/70"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {!user ? (
                <Link to="/auth" className="rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 px-4 py-3 text-center text-sm font-semibold text-white">
                  Join free
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                  className="rounded-2xl border border-white/50 bg-white/75 px-4 py-3 text-left text-sm font-medium dark:border-white/10 dark:bg-slate-900/70"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative z-10 mx-auto w-[min(1320px,calc(100vw-24px))] py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-white/30 bg-white/50 py-10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
        <div className="mx-auto flex w-[min(1320px,calc(100vw-24px))] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-teal-700 dark:text-teal-200">
              <Sparkles className="size-4" />
              Premium resale flow
            </div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
              Buy smarter, sell faster, and keep the experience clean from first click to final chat.
            </h2>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Resellr Premium. Built for recruiters, founders, and serious frontend polish.
          </div>
        </div>
      </footer>

      {user ? <FloatingActionButton /> : null}
    </div>
  );
}
