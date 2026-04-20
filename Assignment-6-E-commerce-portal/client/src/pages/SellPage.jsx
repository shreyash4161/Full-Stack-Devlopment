import { ArrowLeft, ImagePlus, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useListings } from "../context/ListingsContext";

const CATEGORIES = ["Cars", "Mobiles", "Bikes", "Furniture", "Electronics"];

export default function SellPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addListing, updateListing, getListingById } = useListings();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    location: "",
    category: "Mobiles",
    image: "",
  });
  const [imageMode, setImageMode] = useState("url"); // "url" or "upload"
  const [previewUrl, setPreviewUrl] = useState("");

  // Load existing listing if editing
  useEffect(() => {
    if (isEdit) {
      const listing = getListingById(id);
      if (listing) {
        setForm({
          title: listing.title || "",
          price: String(listing.price || ""),
          description: listing.description || "",
          location: listing.location || "",
          category: listing.category || "Mobiles",
          image: listing.image || "",
        });
        setPreviewUrl(listing.image || "");
      } else {
        toast.error("Listing not found");
        navigate("/");
      }
    }
  }, [isEdit, id, getListingById, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "image" && imageMode === "url") {
      setPreviewUrl(value);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setForm((prev) => ({ ...prev, image: dataUrl }));
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.price || !form.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const listingData = {
      title: form.title.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      location: form.location.trim(),
      category: form.category,
      image: form.image.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=60",
    };

    if (isEdit) {
      updateListing(Number(id), listingData);
      toast.success("Listing updated!");
      navigate(`/product/${id}`);
    } else {
      const newListing = addListing(listingData);
      toast.success("Listing posted!");
      navigate(`/product/${newListing.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#002f34] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white border border-gray-200 rounded-md p-6" id="sell-form-container">
        <h1 className="text-xl font-bold text-[#002f34] mb-1">
          {isEdit ? "Edit your listing" : "Post your ad"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isEdit ? "Update the details below" : "Fill in the details to sell your item"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#002f34] mb-1.5">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#002f34] bg-white"
              id="input-category"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#002f34] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 13 128GB in good condition"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#002f34]"
              required
              id="input-title"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-[#002f34] mb-1.5">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 45000"
              min="0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#002f34]"
              required
              id="input-price"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#002f34] mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the condition, age, and any included accessories"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#002f34] resize-none"
              id="input-description"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-[#002f34] mb-1.5">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Pune, Mumbai, Delhi"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#002f34]"
              required
              id="input-location"
            />
          </div>

          {/* Image Section */}
          <div>
            <label className="block text-sm font-semibold text-[#002f34] mb-1.5">
              Product Image
            </label>

            {/* Toggle: URL or Upload */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  imageMode === "url"
                    ? "bg-[#002f34] text-white border-[#002f34]"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                Image URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  imageMode === "upload"
                    ? "bg-[#002f34] text-white border-[#002f34]"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                <ImagePlus className="w-3 h-3" />
                Upload
              </button>
            </div>

            {imageMode === "url" ? (
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#002f34]"
                id="input-image-url"
              />
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-8 cursor-pointer hover:border-[#002f34] transition-colors">
                <ImagePlus className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload an image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="input-image-upload"
                />
              </label>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mt-3 border border-gray-200 rounded-md overflow-hidden" id="image-preview">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={() => setPreviewUrl("")}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#002f34] text-white font-semibold py-3 rounded-md hover:bg-[#003940] transition-colors text-sm"
            id="submit-listing"
          >
            {isEdit ? "Update Listing" : "Post Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
