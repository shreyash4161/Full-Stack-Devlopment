import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function formatPrice(price) {
  return "₹ " + Number(price).toLocaleString("en-IN");
}

export default function ProductCard({ listing }) {
  return (
    <Link
      to={`/product/${listing.id}`}
      className="block bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow group"
      id={`listing-card-${listing.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=60";
          }}
        />
        <span className="absolute top-2 left-2 bg-[#002f34] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
          {listing.category}
        </span>
      </div>
      <div className="p-3">
        <p className="text-lg font-bold text-[#002f34] leading-tight">
          {formatPrice(listing.price)}
        </p>
        <p className="text-sm text-gray-700 mt-1 line-clamp-1">{listing.title}</p>
        <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{listing.description}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </span>
          {listing.createdAt && (
            <span className="text-[10px] text-gray-400">
              {new Date(listing.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
