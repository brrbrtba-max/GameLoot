import { useEffect, useState } from "react";

// Lightweight, best-effort live pricing via the free CheapShark API.
// https://apidocs.cheapshark.com/ — public, CORS-enabled, no API key.
// Everything is wrapped so SSR and network failures fall back silently to the
// static catalog price; the UI never breaks if the API is slow or unreachable.

export interface LivePrice {
  price: number; // current cheapest USD price
  retailPrice: number; // normal/retail USD price
  store: string; // human store name (best-effort)
}

interface CheapSharkGame {
  cheapest?: string;
  cheapestDealID?: string;
  external?: string;
}

// Module-level + localStorage cache so we never re-hit the API for the same
// title within a session/day.
const memCache = new Map<string, LivePrice | null>();
const CACHE_KEY = "gl_live_prices_v1";
const ONE_DAY = 86_400_000;

function loadDiskCache(): Record<string, { v: LivePrice; t: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDiskCache(title: string, v: LivePrice) {
  if (typeof window === "undefined") return;
  try {
    const all = loadDiskCache();
    all[title] = { v, t: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota / parse errors
  }
}

async function fetchLivePrice(title: string, signal: AbortSignal): Promise<LivePrice | null> {
  const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data: CheapSharkGame[] = await res.json();
  const hit = data?.[0];
  if (!hit?.cheapest) return null;
  const price = Number(hit.cheapest);
  const retailRaw = hit.external ? Number(hit.external) : NaN;
  const retailPrice = Number.isFinite(retailRaw) && retailRaw > price ? retailRaw : Math.max(price, price * 1.6);
  if (!Number.isFinite(price) || price <= 0) return null;
  return { price, retailPrice: Math.round(retailPrice * 100) / 100, store: "CheapShark (Live)" };
}

/**
 * Returns a live price for a title, or `null` while loading / on failure.
 * Callers should fall back to their static price when this is null.
 */
export function useLivePrice(title: string, enabled = true): LivePrice | null {
  const [live, setLive] = useState<LivePrice | null>(() => memCache.get(title) ?? null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (memCache.has(title)) {
      setLive(memCache.get(title) ?? null);
      return;
    }
    const disk = loadDiskCache()[title];
    if (disk && Date.now() - disk.t < ONE_DAY) {
      memCache.set(title, disk.v);
      setLive(disk.v);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    fetchLivePrice(title, controller.signal)
      .then((result) => {
        if (cancelled) return;
        memCache.set(title, result);
        if (result) {
          saveDiskCache(title, result);
          setLive(result);
        }
      })
      .catch(() => {
        if (!cancelled) memCache.set(title, null);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [title, enabled]);

  return live;
}
