import { ArrowLeft, MapPin, Phone, Share2, Flag, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useListings } from "../context/ListingsContext";
import ProductCard from "../components/ProductCard";

function formatPrice(price) {
  return "₹ " + Number(price).toLocaleString("en-IN");
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListingById, listings, deleteListing } = useListings();

  const listing = getListingById(id);

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-700">Listing not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-[#002f34] font-medium hover:underline"
        >
          ← Back to listings
        </button>
      </div>
    );
  }

  const similarListings = listings
    .filter((item) => item.category === listing.category && item.id !== listing.id)
    .slice(0, 4);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      deleteListing(listing.id);
      toast.success("Listing deleted");
      navigate("/");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out ${listing.title} for ${formatPrice(listing.price)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#002f34] mb-4 transition-colors"
          id="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Left Column — Image + Description */}
          <div className="space-y-4">
            {/* Image */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden" id="product-image-container">
              <div className="relative aspect-[16/10] bg-gray-50">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=60";
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-md p-5" id="product-description">
              <h3 className="text-base font-bold text-[#002f34] mb-3">Description</h3>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Right Column — Details */}
          <div className="space-y-4">
            {/* Price + Title */}
            <div className="bg-white border border-gray-200 rounded-md p-5" id="product-info">
              <p className="text-2xl font-bold text-[#002f34]">{formatPrice(listing.price)}</p>
              <h1 className="text-base text-gray-700 mt-2">{listing.title}</h1>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.location}
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={handleShare} className="text-gray-400 hover:text-[#002f34] transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-orange-500 transition-colors">
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Badge */}
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Category</p>
              <span className="inline-block bg-gray-100 text-[#002f34] text-sm font-medium px-3 py-1 rounded-full">
                {listing.category}
              </span>
            </div>

            {/* Seller Info */}
            <div className="bg-white border border-gray-200 rounded-md p-5" id="seller-info">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#23e5db] flex items-center justify-center text-[#002f34] font-bold text-lg">
                  {listing.location.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#002f34]">Seller in {listing.location}</p>
                  <p className="text-xs text-gray-500">Member since 2024</p>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 bg-[#002f34] text-white font-semibold py-3 rounded-md hover:bg-[#003940] transition-colors text-sm"
                id="call-seller-btn"
                onClick={() => toast.success("Call feature coming soon!")}
              >
                <Phone className="w-4 h-4" />
                Call Seller
              </button>

              <button
                className="w-full mt-2 flex items-center justify-center gap-2 border-2 border-[#002f34] text-[#002f34] font-semibold py-3 rounded-md hover:bg-[#002f34] hover:text-white transition-colors text-sm"
                onClick={() => toast.success("Chat feature coming soon!")}
              >
                Chat with Seller
              </button>
            </div>

            {/* Edit / Delete */}
            <div className="bg-white border border-gray-200 rounded-md p-4" id="listing-actions">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Manage Listing</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit/${listing.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-md hover:border-[#002f34] hover:text-[#002f34] transition-colors"
                  id="edit-listing-btn"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-600 text-sm font-medium py-2.5 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
                  id="delete-listing-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>

            {/* Posted Info */}
            {listing.createdAt && (
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <p className="text-xs text-gray-500">
                  Posted on {new Date(listing.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Ads */}
        {similarListings.length > 0 && (
          <div className="mt-8" id="similar-listings">
            <h2 className="text-lg font-bold text-[#002f34] mb-4">Similar Ads</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {similarListings.map((item) => (
                <ProductCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
