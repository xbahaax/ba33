"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types/product";

export interface CartEntry {
  productId: string;
  productCode: string;
  productName: string;
  grade: Product["grade"];
  region: string;
  quantityKg: number;
  unitPriceDzd: number;
}

const CART_STORAGE_KEY = "ba33-web-buyer-cart";
const CART_EVENT = "ba33-web-buyer-cart-change";

function readEntries(): CartEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CartEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: CartEntry[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: entries }));
}

export function addProductToCart(product: Product, quantityKg: number) {
  const entries = readEntries();
  const existingEntry = entries.find((entry) => entry.productId === product.id);

  if (existingEntry) {
    existingEntry.quantityKg += quantityKg;
    writeEntries([...entries]);
    return;
  }

  writeEntries([
    ...entries,
    {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      grade: product.grade,
      region: product.region,
      quantityKg,
      unitPriceDzd: product.pricePerKgDzd,
    },
  ]);
}

export function updateCartEntryQuantity(productId: string, quantityKg: number) {
  const entries = readEntries().map((entry) =>
    entry.productId === productId
      ? {
          ...entry,
          quantityKg,
        }
      : entry
  );

  writeEntries(entries.filter((entry) => entry.quantityKg > 0));
}

export function removeCartEntry(productId: string) {
  writeEntries(readEntries().filter((entry) => entry.productId !== productId));
}

export function clearCartEntries() {
  writeEntries([]);
}

export function useCartEntries() {
  const [entries, setEntries] = useState<CartEntry[]>([]);

  useEffect(() => {
    const syncEntries = () => {
      setEntries(readEntries());
    };

    syncEntries();

    window.addEventListener(CART_EVENT, syncEntries);
    window.addEventListener("storage", syncEntries);

    return () => {
      window.removeEventListener(CART_EVENT, syncEntries);
      window.removeEventListener("storage", syncEntries);
    };
  }, []);

  return entries;
}
