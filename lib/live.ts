import { useEffect, useState } from "react";

/**
 * Returns the next upcoming Thursday at 18:00 (local) as a Date.
 * Used to keep "Epic Thursday" and limited-time free giveaways always
 * pointing at a fresh, future deadline so the UI never looks frozen.
 */
export function nextThursday(hour = 18): Date {
  const now = new Date();
  const result = new Date(now);
  const day = now.getDay(); // 0 = Sun ... 4 = Thu
  let diff = (4 - day + 7) % 7;
  // If it's Thursday but already past the cutoff hour, jump to next week.
  if (diff === 0 && now.getHours() >= hour) diff = 7;
  result.setDate(now.getDate() + diff);
  result.setHours(hour, 0, 0, 0);
  return result;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/** Live ticking countdown to an ISO string or Date target. */
export function useCountdown(target: string | Date): Countdown | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const distance = new Date(target).getTime() - now;
  if (distance < 0) return null;
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000),
    total: distance,
  };
}

/**
 * Deterministic pseudo-random in [0,1) from a string seed + a numeric tick.
 * Lets us produce stable-yet-evolving "live" jitter without hydration drift
 * within a render, while still changing when the refresh tick advances.
 */
export function seededRandom(seed: string, tick: number): number {
  let h = 2166136261 ^ tick;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Map to [0,1)
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Shared "live refresh" heartbeat. Every component subscribing gets a tick
 * that advances on an interval (and can be bumped manually), which downstream
 * derivations use to recompute prices/discounts so deals feel active.
 */
export function useLiveTick(intervalMs = 45000): { tick: number; refresh: () => void } {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return { tick, refresh: () => setTick((t) => t + 1) };
}

/**
 * A stable integer that changes once per calendar day. Combined with
 * seededRandom + the live tick, it lets the dashboard mimic a real API that
 * re-prices its catalog daily, so the UI never looks frozen or identical
 * after a few days while staying deterministic within a single day/render.
 */
export function dailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/**
 * Computes a "live" discount score for a game by blending its real discount
 * with a small daily + tick-based jitter. Highest discounts always stay
 * highest; the jitter only reshuffles near-ties so the spotlight rotates.
 */
export function liveDiscountScore(
  id: string,
  price: number,
  retailPrice: number,
  tick: number,
  jitter = 0.2,
): number {
  if (!retailPrice || retailPrice <= 0 || price >= retailPrice) return 0;
  const base = (retailPrice - price) / retailPrice;
  const wobble = seededRandom(id, tick + dailySeed()) * jitter;
  return base + wobble;
}
