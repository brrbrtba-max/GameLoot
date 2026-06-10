import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "ar" | "zh" | "tr" | "fr" | "es" | "hi";
export type Currency = "USD" | "EUR" | "SAR" | "AED" | "CNY" | "TRY" | "INR";

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "fr", label: "French", native: "Français" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export const CURRENCY_INFO: Record<Currency, { symbol: string; rate: number; code: string; suffix?: boolean }> = {
  USD: { symbol: "$", rate: 1, code: "USD" },
  EUR: { symbol: "€", rate: 0.92, code: "EUR" },
  SAR: { symbol: "ر.س", rate: 3.75, code: "SAR", suffix: true },
  AED: { symbol: "د.إ", rate: 3.67, code: "AED", suffix: true },
  CNY: { symbol: "¥", rate: 7.25, code: "CNY" },
  TRY: { symbol: "₺", rate: 32.5, code: "TRY" },
  INR: { symbol: "₹", rate: 83.2, code: "INR" },
};

export interface PriceAlert {
  id: string;
  gameId: string;
  gameTitle: string;
  targetUsd: number;
  currentUsd: number;
  createdAt: number;
}

export interface RawNotification {
  id: string;
  kind: "alert" | "system";
  type: "flash" | "low" | "coupon" | "alert" | "custom";
  unread: boolean;
  createdAt: number; // ms timestamp
  // Structured data per type:
  game?: string;
  discount?: number;
  store?: string;
  coupon?: string;
  targetUsd?: number;
  currentUsd?: number;
  custom?: { en: string; ar: string };
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  kind: "alert" | "system";
}

interface SettingsCtx {
  language: Language;
  setLanguage: (l: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (usd: number) => string;
  formatPriceFromLocal: (local: number) => string;
  toUsd: (local: number) => number;
  t: (key: keyof typeof STRINGS["en"]) => string;
  isRTL: boolean;
  currencyNote: string | null;
  alerts: PriceAlert[];
  addAlert: (a: Omit<PriceAlert, "id" | "createdAt">) => void;
  removeAlert: (gameId: string) => void;
  getAlert: (gameId: string) => PriceAlert | undefined;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  isPrime: boolean;
  setPrime: (v: boolean) => void;
}

const STRINGS = {
  en: {
    deals: "Deals", catalog: "Catalog", free: "Free Games", prime: "Prime",
    settings: "Settings", language: "Language", currency: "Currency",
    notifications: "Notifications", markAllRead: "Mark all read",
    hottestDeals: "Hottest Deals Right Now",
    hottestSub: "Biggest discounts on premium titles — F2P games excluded.",
    trending: "Trending Catalog",
    trendingSub: "Sorted by popularity — most famous games first.",
    searchPlaceholder: "Search games…",
    searchPlaceholderLive: "Search across every global store…",
    searchPlaceholderCatalog: "Search inside this catalog…",
    buy: "Buy", getFree: "Get Free", playNow: "Play Now",
    noResults: "No games match your filters.",
    freeHubTitle: "Permanent Freebies",
    freeHubSub: "Free-to-play forever — no purchase required.",
    primeTitle: "GameLoot Prime",
    primeSub: "Unlock the ultimate deal-hunting experience.",
    subscribeNow: "Subscribe Now",
    primeBenefit1: "Instant Price Push Alerts",
    primeBenefit2: "100% Ad-Free Browsing",
    primeBenefit3: "Exclusive Hidden Coupons",
    primeBenefit4: "5-Year Price History Graphs",
    notifyMe: "Notify Me",
    setAlert: "Set Price Alert",
    alertDesc: "Get notified when this game drops to your target price.",
    targetPrice: "Target Price",
    saveAlert: "Save Alert",
    removeAlert: "Remove Alert",
    currentPrice: "Current price",
    activeAlert: "Alert active",
    noNotifications: "No notifications yet.",
    suggestedDeals: "Suggested deals to explore",
    suggestedSub: "Hottest discounts you can grab right now.",
    primeMember: "Prime Member",
    primeActive: "You're a Prime Member",
    home: "Home", profile: "Profile",
    currencyNoteTRY: "Approximate local-currency estimate — official store price may differ.",
  },
  ar: {
    deals: "العروض", catalog: "الكتالوج", free: "ألعاب مجانية", prime: "برايم",
    settings: "الإعدادات", language: "اللغة", currency: "العملة",
    notifications: "الإشعارات", markAllRead: "تحديد الكل كمقروء",
    hottestDeals: "أهم العروض الآن",
    hottestSub: "أكبر التخفيضات على الألعاب المميزة — باستثناء المجانية.",
    trending: "الكتالوج الرائج",
    trendingSub: "مرتبة حسب الشهرة.",
    searchPlaceholder: "ابحث عن لعبة…",
    searchPlaceholderLive: "ابحث في جميع المتاجر العالمية…",
    searchPlaceholderCatalog: "ابحث داخل هذا الكتالوج…",
    buy: "اشترِ", getFree: "احصل مجاناً", playNow: "العب الآن",
    noResults: "لا توجد ألعاب مطابقة.",
    freeHubTitle: "ألعاب مجانية دائماً",
    freeHubSub: "العب مجاناً للأبد.",
    primeTitle: "كويست برايس برايم",
    primeSub: "اكتشف أفضل تجربة لاصطياد العروض.",
    subscribeNow: "اشترك الآن",
    primeBenefit1: "تنبيهات فورية بانخفاض الأسعار",
    primeBenefit2: "تصفح خالٍ من الإعلانات",
    primeBenefit3: "كوبونات حصرية مخفية",
    primeBenefit4: "رسوم بيانية لتاريخ الأسعار 5 سنوات",
    notifyMe: "نبهني",
    setAlert: "ضبط تنبيه السعر",
    alertDesc: "احصل على إشعار عند انخفاض السعر للمستوى المطلوب.",
    targetPrice: "السعر المستهدف",
    saveAlert: "حفظ التنبيه",
    removeAlert: "إزالة التنبيه",
    currentPrice: "السعر الحالي",
    activeAlert: "تنبيه نشط",
    noNotifications: "لا توجد إشعارات بعد.",
    suggestedDeals: "صفقات مقترحة لاستكشافها",
    suggestedSub: "أهم التخفيضات المتاحة الآن.",
    primeMember: "عضو برايم",
    primeActive: "أنت الآن عضو برايم",
    home: "الرئيسية", profile: "حسابي",
    currencyNoteTRY: "سعر تقريبي بالعملة المحلية - قد يختلف في المتجر الرسمي",
  },
  zh: {
    deals: "优惠", catalog: "目录", free: "免费游戏", prime: "Prime",
    settings: "设置", language: "语言", currency: "货币",
    notifications: "通知", markAllRead: "全部标为已读",
    hottestDeals: "最热门折扣",
    hottestSub: "高级游戏的最大折扣 — 不含免费游戏。",
    trending: "热门目录", trendingSub: "按热度排序。",
    searchPlaceholder: "搜索游戏…",
    searchPlaceholderLive: "在全球商店中搜索…",
    searchPlaceholderCatalog: "在此目录中搜索…",
    buy: "购买", getFree: "免费获取", playNow: "立即玩",
    noResults: "没有匹配的游戏。",
    freeHubTitle: "永久免费", freeHubSub: "永远免费畅玩。",
    primeTitle: "GameLoot Prime", primeSub: "解锁终极优惠体验。",
    subscribeNow: "立即订阅",
    primeBenefit1: "即时降价提醒", primeBenefit2: "100% 无广告",
    primeBenefit3: "独家隐藏优惠券", primeBenefit4: "5 年价格历史图表",
    notifyMe: "提醒我", setAlert: "设置价格提醒",
    alertDesc: "当价格降至目标时通知您。",
    targetPrice: "目标价格", saveAlert: "保存提醒", removeAlert: "移除提醒",
    currentPrice: "当前价格", activeAlert: "提醒已启用",
    noNotifications: "暂无通知。",
    suggestedDeals: "推荐优惠", suggestedSub: "立即可领取的最佳折扣。",
    primeMember: "Prime 会员", primeActive: "您已是 Prime 会员",
    currencyNoteTRY: "本地货币近似价 — 官方商店可能不同。",
  },
  tr: {
    deals: "Fırsatlar", catalog: "Katalog", free: "Ücretsiz Oyunlar", prime: "Prime",
    settings: "Ayarlar", language: "Dil", currency: "Para Birimi",
    notifications: "Bildirimler", markAllRead: "Tümünü okundu işaretle",
    hottestDeals: "En Sıcak Fırsatlar",
    hottestSub: "Premium oyunlarda büyük indirimler — F2P hariç.",
    trending: "Trend Katalog", trendingSub: "Popülerliğe göre sıralı.",
    searchPlaceholder: "Oyun ara…",
    searchPlaceholderLive: "Tüm dünya mağazalarında ara…",
    searchPlaceholderCatalog: "Bu katalogda ara…",
    buy: "Satın Al", getFree: "Ücretsiz Al", playNow: "Şimdi Oyna",
    noResults: "Eşleşen oyun yok.",
    freeHubTitle: "Sürekli Ücretsiz", freeHubSub: "Sonsuza dek ücretsiz oyna.",
    primeTitle: "GameLoot Prime", primeSub: "Nihai fırsat avlama deneyimi.",
    subscribeNow: "Hemen Abone Ol",
    primeBenefit1: "Anında Fiyat Bildirimleri", primeBenefit2: "100% Reklamsız",
    primeBenefit3: "Özel Gizli Kuponlar", primeBenefit4: "5 Yıllık Fiyat Geçmişi",
    notifyMe: "Beni Bilgilendir", setAlert: "Fiyat Uyarısı Ayarla",
    alertDesc: "Hedef fiyata düştüğünde haber ver.",
    targetPrice: "Hedef Fiyat", saveAlert: "Uyarıyı Kaydet", removeAlert: "Uyarıyı Kaldır",
    currentPrice: "Mevcut fiyat", activeAlert: "Uyarı aktif",
    noNotifications: "Henüz bildirim yok.",
    suggestedDeals: "Önerilen Fırsatlar", suggestedSub: "Şimdi kapabileceğin en sıcak indirimler.",
    primeMember: "Prime Üyesi", primeActive: "Prime üyesisiniz",
    currencyNoteTRY: "Yaklaşık yerel kur — resmi mağaza fiyatı farklı olabilir.",
  },
  fr: {
    deals: "Offres", catalog: "Catalogue", free: "Jeux Gratuits", prime: "Prime",
    settings: "Paramètres", language: "Langue", currency: "Devise",
    notifications: "Notifications", markAllRead: "Tout marquer comme lu",
    hottestDeals: "Meilleures Offres", hottestSub: "Plus grosses réductions — hors F2P.",
    trending: "Catalogue Tendance", trendingSub: "Trié par popularité.",
    searchPlaceholder: "Rechercher…",
    searchPlaceholderLive: "Rechercher dans toutes les boutiques…",
    searchPlaceholderCatalog: "Rechercher dans ce catalogue…",
    buy: "Acheter", getFree: "Obtenir", playNow: "Jouer",
    noResults: "Aucun jeu trouvé.",
    freeHubTitle: "Gratuits Permanents", freeHubSub: "Gratuits pour toujours.",
    primeTitle: "GameLoot Prime", primeSub: "L'expérience ultime de chasse aux offres.",
    subscribeNow: "S'abonner",
    primeBenefit1: "Alertes prix instantanées", primeBenefit2: "Sans publicité",
    primeBenefit3: "Coupons exclusifs", primeBenefit4: "Historique 5 ans",
    notifyMe: "Me Notifier", setAlert: "Définir une alerte",
    alertDesc: "Soyez notifié quand le prix baisse.",
    targetPrice: "Prix cible", saveAlert: "Enregistrer", removeAlert: "Supprimer",
    currentPrice: "Prix actuel", activeAlert: "Alerte active",
    noNotifications: "Aucune notification.",
    suggestedDeals: "Offres suggérées", suggestedSub: "Les meilleures réductions disponibles.",
    primeMember: "Membre Prime", primeActive: "Vous êtes membre Prime",
    currencyNoteTRY: "Estimation locale approximative — le prix officiel peut varier.",
  },
  es: {
    deals: "Ofertas", catalog: "Catálogo", free: "Juegos Gratis", prime: "Prime",
    settings: "Ajustes", language: "Idioma", currency: "Moneda",
    notifications: "Notificaciones", markAllRead: "Marcar todo leído",
    hottestDeals: "Mejores Ofertas", hottestSub: "Mayores descuentos — sin F2P.",
    trending: "Catálogo Popular", trendingSub: "Ordenado por popularidad.",
    searchPlaceholder: "Buscar juegos…",
    searchPlaceholderLive: "Buscar en todas las tiendas…",
    searchPlaceholderCatalog: "Buscar en este catálogo…",
    buy: "Comprar", getFree: "Conseguir", playNow: "Jugar",
    noResults: "Sin resultados.",
    freeHubTitle: "Gratis Permanente", freeHubSub: "Gratis para siempre.",
    primeTitle: "GameLoot Prime", primeSub: "La experiencia definitiva de ofertas.",
    subscribeNow: "Suscribirse",
    primeBenefit1: "Alertas instantáneas", primeBenefit2: "Sin anuncios",
    primeBenefit3: "Cupones exclusivos", primeBenefit4: "Historial 5 años",
    notifyMe: "Avísame", setAlert: "Crear alerta de precio",
    alertDesc: "Te avisamos cuando baje al precio objetivo.",
    targetPrice: "Precio objetivo", saveAlert: "Guardar", removeAlert: "Eliminar",
    currentPrice: "Precio actual", activeAlert: "Alerta activa",
    noNotifications: "Sin notificaciones.",
    suggestedDeals: "Ofertas sugeridas", suggestedSub: "Los mejores descuentos disponibles.",
    primeMember: "Miembro Prime", primeActive: "Eres miembro Prime",
    currencyNoteTRY: "Precio local aproximado — la tienda oficial puede variar.",
  },
  hi: {
    deals: "ऑफर", catalog: "कैटलॉग", free: "मुफ्त गेम्स", prime: "प्राइम",
    settings: "सेटिंग्स", language: "भाषा", currency: "मुद्रा",
    notifications: "सूचनाएँ", markAllRead: "सभी पढ़े के रूप में चिह्नित करें",
    hottestDeals: "सबसे हॉट डील्स",
    hottestSub: "प्रीमियम गेम्स पर सबसे बड़ी छूट — F2P को छोड़कर।",
    trending: "ट्रेंडिंग कैटलॉग", trendingSub: "लोकप्रियता के अनुसार।",
    searchPlaceholder: "गेम खोजें…",
    searchPlaceholderLive: "सभी वैश्विक स्टोर में खोजें…",
    searchPlaceholderCatalog: "इस कैटलॉग में खोजें…",
    buy: "खरीदें", getFree: "मुफ्त पाएं", playNow: "अभी खेलें",
    noResults: "कोई गेम नहीं मिला।",
    freeHubTitle: "हमेशा मुफ्त", freeHubSub: "हमेशा के लिए मुफ्त।",
    primeTitle: "GameLoot Prime", primeSub: "अंतिम डील-हंटिंग अनुभव।",
    subscribeNow: "सदस्यता लें",
    primeBenefit1: "तुरंत मूल्य अलर्ट", primeBenefit2: "100% विज्ञापन-मुक्त",
    primeBenefit3: "विशेष कूपन", primeBenefit4: "5 साल का मूल्य इतिहास",
    notifyMe: "सूचित करें", setAlert: "मूल्य अलर्ट सेट करें",
    alertDesc: "लक्ष्य मूल्य पर पहुँचने पर सूचित किया जाएगा।",
    targetPrice: "लक्ष्य मूल्य", saveAlert: "अलर्ट सहेजें", removeAlert: "अलर्ट हटाएँ",
    currentPrice: "वर्तमान मूल्य", activeAlert: "अलर्ट सक्रिय",
    noNotifications: "अभी तक कोई सूचना नहीं।",
    suggestedDeals: "सुझाए गए डील्स", suggestedSub: "अभी उपलब्ध सबसे हॉट छूट।",
    primeMember: "प्राइम सदस्य", primeActive: "आप प्राइम सदस्य हैं",
    currencyNoteTRY: "अनुमानित स्थानीय मुद्रा — आधिकारिक स्टोर भिन्न हो सकता है।",
  },
} as const;

const RTL_LANGS: Language[] = ["ar"];

// Arabic numerals
const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const toArDigits = (s: string | number) => String(s).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

function formatRelativeTime(createdAt: number, lang: Language): string {
  const diff = Date.now() - createdAt;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (lang === "ar") {
    if (m < 1) return "الآن";
    if (m < 60) return `منذ ${toArDigits(m)} د`;
    if (h === 1) return "منذ ساعة";
    if (h < 24) return `منذ ${toArDigits(h)} س`;
    if (d < 2) return "اليوم";
    return `منذ ${toArDigits(d)} ي`;
  }
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 2) return "Today";
  return `${d}d`;
}

const NOTIF_TYPE_LABEL: Record<string, Record<Language, string>> = {
  flash: {
    en: "Flash Deal", ar: "صفقة خاطفة", zh: "限时优惠", tr: "Şimşek Fırsat",
    fr: "Offre Éclair", es: "Oferta Relámpago", hi: "फ्लैश डील",
  },
  low: {
    en: "Historical Low", ar: "أدنى سعر تاريخي", zh: "历史最低", tr: "Tarihi Düşük",
    fr: "Plus Bas Historique", es: "Mínimo Histórico", hi: "ऐतिहासिक न्यूनतम",
  },
  coupon: {
    en: "Coupon Available", ar: "كوبون متاح", zh: "优惠券可用", tr: "Kupon Mevcut",
    fr: "Coupon Disponible", es: "Cupón Disponible", hi: "कूपन उपलब्ध",
  },
  alert: {
    en: "Price Alert!", ar: "تنبيه السعر!", zh: "价格提醒！", tr: "Fiyat Uyarısı!",
    fr: "Alerte Prix !", es: "¡Alerta de Precio!", hi: "मूल्य अलर्ट!",
  },
};

function localizeBody(n: RawNotification, lang: Language, formatPrice: (u: number) => string): string {
  if (n.custom) return lang === "ar" ? n.custom.ar : n.custom.en;
  const pct = n.discount ?? 0;
  const pctStr = lang === "ar" ? toArDigits(pct) : String(pct);
  switch (n.type) {
    case "flash":
      return lang === "ar"
        ? `خصم ${pctStr}% على لعبة ${n.game} في متجر ${n.store}.`
        : `${n.game} ${pct}% OFF on ${n.store}.`;
    case "low":
      return lang === "ar"
        ? `وصلت لعبة ${n.game} إلى أدنى سعر تاريخي ${formatPrice(n.currentUsd ?? 0)} في ${n.store}.`
        : `${n.game} hits ${formatPrice(n.currentUsd ?? 0)} on ${n.store}.`;
    case "coupon":
      return lang === "ar"
        ? `استخدم كود ${n.coupon} للحصول على خصم ${pctStr}% في ${n.store}.`
        : `Use ${n.coupon} for ${pct}% off on ${n.store}.`;
    case "alert":
      return lang === "ar"
        ? `انخفض سعر ${n.game} إلى ${formatPrice(n.currentUsd ?? 0)} (هدفك: ${formatPrice(n.targetUsd ?? 0)}).`
        : `${n.game} dropped to ${formatPrice(n.currentUsd ?? 0)} (target: ${formatPrice(n.targetUsd ?? 0)}).`;
    default:
      return "";
  }
}

const NOW = () => Date.now();
const SEED_NOTIFS: RawNotification[] = [
  { id: "s1", kind: "system", type: "flash", unread: true, createdAt: NOW() - 18 * 60_000, game: "Cyberpunk 2077", discount: 50, store: "GOG" },
  { id: "s2", kind: "system", type: "low", unread: true, createdAt: NOW() - 60 * 60_000, game: "Red Dead Redemption 2", currentUsd: 19.79, store: "Steam" },
  { id: "s3", kind: "system", type: "coupon", unread: false, createdAt: NOW() - 5 * 3600_000, coupon: "QP10", discount: 10, store: "Fanatical" },
];

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [rawNotifs, setRawNotifs] = useState<RawNotification[]>(SEED_NOTIFS);
  const [isPrime, setPrime] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = RTL_LANGS.includes(language) ? "rtl" : "ltr";
    }
  }, [language]);

  const formatPrice = useCallback(
    (usd: number) => {
      const info = CURRENCY_INFO[currency];
      const v = (usd * info.rate).toFixed(2);
      return info.suffix ? `${v} ${info.symbol}` : `${info.symbol}${v}`;
    },
    [currency],
  );

  const toUsd = useCallback(
    (local: number) => local / CURRENCY_INFO[currency].rate,
    [currency],
  );

  const addAlert = useCallback<SettingsCtx["addAlert"]>((a) => {
    const id = `${a.gameId}-${Date.now()}`;
    setAlerts((prev) => [...prev.filter((x) => x.gameId !== a.gameId), { ...a, id, createdAt: Date.now() }]);
    const pushAlert = (current: number) => {
      setRawNotifs((prev) => [
        {
          id: `a-${id}`,
          kind: "alert",
          type: "alert",
          unread: true,
          createdAt: Date.now(),
          game: a.gameTitle,
          targetUsd: a.targetUsd,
          currentUsd: current,
        },
        ...prev,
      ]);
    };
    if (a.currentUsd <= a.targetUsd) pushAlert(a.currentUsd);
    else {
      const dropped = Math.max(a.targetUsd - 0.01, a.currentUsd * 0.7);
      setTimeout(() => pushAlert(dropped), 4000);
    }
  }, []);

  const removeAlert = useCallback((gameId: string) => {
    setAlerts((prev) => prev.filter((a) => a.gameId !== gameId));
  }, []);

  const markAllRead = useCallback(() => {
    setRawNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const notifications = useMemo<Notification[]>(
    () =>
      rawNotifs.map((n) => ({
        id: n.id,
        kind: n.kind,
        unread: n.unread,
        title: NOTIF_TYPE_LABEL[n.type]?.[language] ?? "",
        body: localizeBody(n, language, formatPrice),
        time: formatRelativeTime(n.createdAt, language),
      })),
    [rawNotifs, language, formatPrice],
  );

  const value = useMemo<SettingsCtx>(() => ({
    language, setLanguage, currency, setCurrency,
    formatPrice,
    formatPriceFromLocal: (local) => {
      const info = CURRENCY_INFO[currency];
      const v = local.toFixed(2);
      return info.suffix ? `${v} ${info.symbol}` : `${info.symbol}${v}`;
    },
    toUsd,
    t: (key) => (STRINGS[language] as Record<string, string>)[key as string] ?? (STRINGS.en as Record<string, string>)[key as string],
    isRTL: RTL_LANGS.includes(language),
    currencyNote: currency === "TRY" ? (STRINGS[language] as Record<string, string>).currencyNoteTRY : null,
    alerts,
    addAlert,
    removeAlert,
    getAlert: (gameId) => alerts.find((a) => a.gameId === gameId),
    notifications,
    unreadCount: notifications.filter((n) => n.unread).length,
    markAllRead,
    isPrime, setPrime,
  }), [language, currency, formatPrice, toUsd, alerts, addAlert, removeAlert, notifications, markAllRead, isPrime]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSettings must be used within SettingsProvider");
  return c;
}
