'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  getWishlist,
  getWishlistIds,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '@/lib/api';

const WISHLIST_STORAGE_KEY = 'dr_yousef_wishlist';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  loading: boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function loadGuestWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestWishlist(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch from Supabase when authenticated
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [items, ids] = await Promise.all([
      getWishlist(user.id),
      getWishlistIds(user.id),
    ]);
    setWishlist(items);
    setWishlistIds(ids);
    setLoading(false);
  }, [user]);

  // On login: load guest wishlist, merge to DB, then fetch from DB
  useEffect(() => {
    if (isAuthenticated && user) {
      (async () => {
        const guestProducts = loadGuestWishlist();
        if (guestProducts.length > 0) {
          // Add guest wishlist items to DB (ignore duplicates)
          for (const p of guestProducts) {
            const existing = await getWishlistIds(user.id);
            if (!existing.has(p.id)) {
              await apiAddToWishlist(user.id, p.id);
            }
          }
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        }
        await fetchWishlist();
      })();
    } else if (!isAuthenticated) {
      // Load from localStorage for guests
      const guestProducts = loadGuestWishlist();
      setWishlist(guestProducts);
      setWishlistIds(new Set(guestProducts.map((p) => p.id)));
    }
  }, [isAuthenticated, user, fetchWishlist]);

  const toggleWishlist = useCallback(async (product: Product) => {
    const isCurrentlyWishlisted = wishlistIds.has(product.id);

    if (isCurrentlyWishlisted) {
      // Remove
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      setWishlist((prev) => {
        const next = prev.filter((p) => p.id !== product.id);
        if (!isAuthenticated) saveGuestWishlist(next);
        return next;
      });
      if (isAuthenticated && user) {
        await apiRemoveFromWishlist(user.id, product.id);
      }
    } else {
      // Add
      setWishlistIds((prev) => new Set(prev).add(product.id));
      setWishlist((prev) => {
        const next = [product, ...prev];
        if (!isAuthenticated) saveGuestWishlist(next);
        return next;
      });
      if (isAuthenticated && user) {
        await apiAddToWishlist(user.id, product.id);
      }
    }
  }, [user, wishlistIds, isAuthenticated]);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
