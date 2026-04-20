import { createContext, useContext, useEffect, useState } from "react";
import seedListings from "../data/listings.json";

const ListingsContext = createContext(null);

const STORAGE_KEY = "resellr-nexus-listings";

function loadListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_e) {
    // ignore
  }
  // Seed with default data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedListings));
  return seedListings;
}

function saveListings(listings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState(loadListings);

  useEffect(() => {
    saveListings(listings);
  }, [listings]);

  const addListing = (listing) => {
    const newListing = {
      ...listing,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = (id, updates) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteListing = (id) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const getListingById = (id) => {
    return listings.find((item) => item.id === Number(id));
  };

  return (
    <ListingsContext.Provider
      value={{ listings, addListing, updateListing, deleteListing, getListingById }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) throw new Error("useListings must be used within ListingsProvider");
  return context;
}
