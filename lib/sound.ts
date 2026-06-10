// Lightweight UI sound effects using the Web Audio API — no asset files needed.
// Synthesizes a clean, subtle "pop/click" tone on demand and exposes a global
// delegated listener so every button / link / interactive chip plays it.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      // @ts-ignore - webkitAudioContext fallback for older Safari
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Play a subtle, clean click/pop. */
export function playClick() {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === "suspended") ac.resume();
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = "sine";
    // Quick downward chirp gives a soft "pop" feel.
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Audio is best-effort; ignore failures silently.
  }
}

export function setMuted(v: boolean) {
  muted = v;
}

let initialized = false;
/**
 * Registers a single delegated pointer listener that plays the click on any
 * tappable element (buttons, links, role=button, or anything tagged .sound-tap).
 * Safe to call multiple times — only the first call wires up the listener.
 */
export function initUiSounds() {
  if (initialized || typeof document === "undefined") return;
  initialized = true;
  const handler = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const el = target.closest(
      "button, a, [role='button'], .sound-tap, input[type='checkbox'], input[type='radio']",
    );
    if (el) playClick();
  };
  // pointerdown fires immediately on tap for snappy feedback.
  document.addEventListener("pointerdown", handler, { passive: true });
}
