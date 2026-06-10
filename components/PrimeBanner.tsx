import { useState } from "react";
import { Crown, Zap, ShieldOff, Ticket, LineChart, Check, CreditCard, Lock, Copy, Sparkles, Gift, Brain } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PRIME_COUPONS = [
  { code: "PRIME15-STEAM", label: "15% off Steam Wallet top-ups" },
  { code: "PRIME-GOG10", label: "10% off any GOG purchase" },
  { code: "PRIME-EPIC5", label: "$5 off Epic Games Store" },
];

export function PrimeBanner() {
  const { t, isRTL, isPrime, setPrime } = useSettings();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"plan" | "checkout" | "done">("plan");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });
  const [processing, setProcessing] = useState(false);

  // Irresistible premium feature checklist (bilingual).
  const benefits = [
    {
      icon: Gift,
      label: isRTL
        ? "متتبع الهدايا الفوري: لا تفوّت أي لعبة مجانية 100% على Epic أو Steam."
        : "Instant Giveaway Tracker: Never miss a 100% FREE game on Epic or Steam.",
    },
    {
      icon: Brain,
      label: isRTL
        ? "توقع الأسعار بالذكاء الاصطناعي: يخبرك إن كان سعر اللعبة سينخفض أكثر الشهر القادم."
        : "AI Price Prediction: Know if a game's price will drop further next month.",
    },
    {
      icon: Ticket,
      label: isRTL
        ? "كوبونات مخفية حصرية: أكواد خصم إضافية لمزيد من التوفير."
        : "Exclusive Hidden Coupons: Extra promo codes for additional savings.",
    },
    {
      icon: LineChart,
      label: isRTL
        ? "رسوم بيانية لتاريخ الأسعار لـ 5 سنوات."
        : "5-Year Detailed Price History Graphs.",
    },
    {
      icon: Zap,
      label: isRTL ? "تنبيهات فورية بانخفاض الأسعار." : "Instant price-drop push alerts.",
    },
    {
      icon: ShieldOff,
      label: isRTL ? "تصفح خالٍ 100% من الإعلانات." : "100% Ad-Free Browsing.",
    },
  ];

  const openCheckout = () => {
    setStep("plan");
    setOpen(true);
  };

  const fakePay = () => {
    if (card.number.replace(/\s/g, "").length < 12 || !card.exp || card.cvc.length < 3) {
      toast.error("Please complete your card details.");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep("done");
      setPrime(true);
      toast.success("Welcome to GameLoot Prime!", {
        description: "Premium benefits unlocked. Hidden coupons are now visible.",
      });
    }, 1400);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(`Coupon ${code} copied!`);
  };

  return (
    <section id="prime" className="container mx-auto px-4 py-12">
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/40 p-8 md:p-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.05 270) 0%, oklch(0.18 0.04 250) 50%, oklch(0.25 0.08 280) 100%)",
          boxShadow: "var(--shadow-glow), 0 0 60px oklch(0.7 0.18 280 / 0.25)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, oklch(0.78 0.19 145 / 0.4), transparent 45%), radial-gradient(circle at 85% 80%, oklch(0.7 0.2 290 / 0.5), transparent 45%)",
          }}
        />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/30 backdrop-blur px-3 py-1 text-xs font-bold text-primary mb-4">
              <Crown className="h-3.5 w-3.5" /> {isPrime ? t("primeActive") : "PREMIUM"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {t("primeTitle")}
            </h2>
            <p className="mt-2 text-base text-muted-foreground max-w-lg">{t("primeSub")}</p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">
              {benefits.map((b) => (
                <li key={b.label} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
                    <b.icon className="h-4 w-4" />
                  </span>
                  {b.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="md:text-right">
              <div className="flex items-baseline gap-1 md:justify-end">
                <div className="text-4xl font-extrabold text-foreground">
                  $2.99<span className="text-sm font-medium text-muted-foreground">/mo</span>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">{isRTL ? "اشتراك شهري — يُلغى في أي وقت" : "Billed monthly — cancel anytime"}</div>
            </div>
            <button
              onClick={isPrime ? () => setPrime(false) : openCheckout}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
              style={{ boxShadow: "0 0 30px oklch(0.78 0.19 145 / 0.6)" }}
            >
              <Crown className="h-4 w-4" />
              {isPrime ? "Cancel Prime" : t("subscribeNow")}
            </button>
          </div>
        </div>

        {/* Exclusive coupons unlocked for Prime members */}
        {isPrime && (
          <div className="relative mt-8 rounded-xl border border-accent/40 bg-background/40 backdrop-blur p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <div className="text-sm font-bold text-foreground">{t("primeBenefit3")}</div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {PRIME_COUPONS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => copyCoupon(c.code)}
                  className="group text-left rounded-lg border border-border bg-card/60 p-3 hover:border-accent transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-sm font-extrabold text-accent">{c.code}</div>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition" />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {step === "plan" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Crown className="h-5 w-5 text-primary" /> GameLoot Prime
                </DialogTitle>
                <DialogDescription>
                  Unlock historical price charts, instant deal alerts, and ad-free browsing.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 text-sm">
                {benefits.map((b) => (
                  <li key={b.label} className="flex items-center gap-2 text-foreground/90">
                    <Check className="h-4 w-4 text-primary" /> {b.label}
                  </li>
                ))}
              </ul>
              <div className="rounded-lg border border-primary/30 bg-muted/40 p-4 text-center">
                <div className="text-xs uppercase tracking-widest text-primary font-bold">Membership</div>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <div className="text-3xl font-extrabold text-foreground">
                    $2.99<span className="text-sm font-medium text-muted-foreground">/mo</span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">Billed monthly — cancel anytime</div>
              </div>
              <DialogFooter>
                <button
                  onClick={() => setStep("checkout")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground transition hover:brightness-110 active:scale-95"
                >
                  <CreditCard className="h-4 w-4" /> Continue to checkout
                </button>
              </DialogFooter>
            </>
          )}

          {step === "checkout" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-4 w-4 text-primary" /> Secure mock checkout
                </DialogTitle>
                <DialogDescription>
                  This is a demo — no real charge is made. Use any test card.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cardholder</span>
                  <input
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="Jane Player"
                    className="mt-1 w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card number</span>
                  <input
                    value={card.number}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        number: e.target.value.replace(/[^\d ]/g, "").slice(0, 19),
                      })
                    }
                    placeholder="4242 4242 4242 4242"
                    className="mt-1 w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</span>
                    <input
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: e.target.value.slice(0, 5) })}
                      placeholder="MM/YY"
                      className="mt-1 w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CVC</span>
                    <input
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="123"
                      className="mt-1 w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <span className="text-muted-foreground">Prime monthly</span>
                  <span className="font-extrabold text-foreground">$2.99</span>
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={fakePay}
                  disabled={processing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                >
                  <Lock className="h-4 w-4" />
                  {processing ? "Processing…" : "Pay $2.99 & Activate"}
                </button>
              </DialogFooter>
            </>
          )}

          {step === "done" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Check className="h-5 w-5 text-accent" /> You're a Prime member
                </DialogTitle>
                <DialogDescription>
                  All ads are off, price-history graphs are unlocked, and hidden coupons are now revealed below.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground transition hover:brightness-110"
                >
                  Start exploring
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
