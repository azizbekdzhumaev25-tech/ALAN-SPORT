"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ProductItem } from "@/lib/products";
import FavoritesDrawer from "./FavoritesDrawer";

type ShopCtxType = {
  favorites: ProductItem[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (p: ProductItem) => void;
  openFavorites: () => void;
};

const ShopCtx = createContext<ShopCtxType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  openFavorites: () => {},
});

export function useShop() {
  return useContext(ShopCtx);
}

const STORAGE_KEY = "alan-sport-favorites";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ProductItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProductItem[];
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function toggleFavorite(p: ProductItem) {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === p.id);
      const next = exists ? prev.filter((f) => f.id !== p.id) : [...prev, p];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <ShopCtx.Provider
      value={{
        favorites,
        isFavorite: (id) => favorites.some((f) => f.id === id),
        toggleFavorite,
        openFavorites: () => setDrawerOpen(true),
      }}
    >
      {children}
      <FavoritesDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </ShopCtx.Provider>
  );
}
