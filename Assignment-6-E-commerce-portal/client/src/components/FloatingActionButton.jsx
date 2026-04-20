import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function FloatingActionButton() {
  return (
    <Link
      to="/sell"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full border border-white/60 bg-gradient-to-r from-teal-500 to-sky-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(14,165,233,0.35)] transition hover:-translate-y-1"
    >
      <Plus className="size-4" />
      Add Product
    </Link>
  );
}
