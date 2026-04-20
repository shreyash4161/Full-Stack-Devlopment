import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellPage from "./pages/SellPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/sell" element={<SellPage />} />
          <Route path="/edit/:id" element={<SellPage />} />
        </Routes>
      </main>
      <footer className="bg-[#012f34] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3 text-[#23e5db]">Popular Locations</h4>
              <ul className="space-y-1.5 text-gray-300">
                <li>Mumbai</li>
                <li>Delhi</li>
                <li>Bangalore</li>
                <li>Pune</li>
                <li>Chennai</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#23e5db]">Trending Searches</h4>
              <ul className="space-y-1.5 text-gray-300">
                <li>iPhone</li>
                <li>Cars</li>
                <li>Bikes</li>
                <li>Laptops</li>
                <li>Furniture</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#23e5db]">About Us</h4>
              <ul className="space-y-1.5 text-gray-300">
                <li>About Resellr Nexus</li>
                <li>Careers</li>
                <li>Contact Us</li>
                <li>Marketplace Team</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#23e5db]">Resellr Nexus</h4>
              <ul className="space-y-1.5 text-gray-300">
                <li>Help</li>
                <li>Sitemap</li>
                <li>Legal & Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Resellr Nexus — Local marketplace platform
          </div>
        </div>
      </footer>
    </div>
  );
}
