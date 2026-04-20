import { Search, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logoBadge from "../assets/resellr-badge.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/");
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0" id="nav-logo">
            <img src={logoBadge} alt="Resellr Nexus" className="h-9 w-auto object-contain" />
          </Link>

          {/* Search Bar — Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl items-center border-2 border-[#002f34] rounded-md overflow-hidden"
            id="desktop-search"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find Cars, Mobile Phones and more..."
              className="flex-1 px-4 py-2 text-sm outline-none bg-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#002f34] px-4 py-2.5 text-white hover:bg-[#003940] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Sell Button — Desktop */}
          <Link
            to="/sell"
            className="hidden md:inline-flex items-center gap-2 bg-white border-2 border-[#002f34] text-[#002f34] font-semibold px-5 py-2 rounded-full hover:bg-[#002f34] hover:text-white transition-colors text-sm"
            id="sell-button"
          >
            <Plus className="w-4 h-4" />
            <span>SELL</span>
          </Link>

          {/* Mobile: Search + Menu */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link
              to="/sell"
              className="inline-flex items-center gap-1.5 bg-[#002f34] text-white font-semibold px-4 py-2 rounded-full text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              SELL
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#002f34]"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-3">
          <form onSubmit={handleSearch} className="flex items-center border-2 border-[#002f34] rounded-md overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find Cars, Phones..."
              className="flex-1 px-3 py-2 text-sm outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#002f34] px-3 py-2.5 text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
