import clsx from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value || 0));
}

export function timeAgo(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const ranges = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60]
  ];

  for (const [unit, threshold] of ranges) {
    if (seconds >= threshold) {
      const amount = Math.floor(seconds / threshold);
      return `${amount} ${unit}${amount > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

export function buildListingFormData(payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "images") {
      Array.from(value || []).forEach((file) => {
        formData.append("images", file);
      });
      return;
    }

    if (value === undefined || value === null) return;
    formData.append(key, value);
  });

  return formData;
}

export function initialListingForm(overrides = {}) {
  return {
    title: "",
    description: "",
    price: "",
    category: "Electronics",
    condition: "Used",
    brand: "",
    model: "",
    year: "",
    city: "",
    state: "",
    fuelType: "",
    transmission: "",
    featured: false,
    images: [],
    ...overrides
  };
}
