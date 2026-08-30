export const SITE = {
  name: "ALAN SPORT",
  tagline: "Kuch. Tezlik. Uslub.",
  phone: "+998 93 476 27 27",
  phoneHref: "tel:+998934762727",
  phone2: "+998 93 473 00 00",
  phone2Href: "tel:+998934730000",
  address: "Buxoro shahri, Xafiz Tanish Buxori ko'chasi, 10",
  hours: "Har kuni: 09:00 – 23:00",
  telegram: "https://t.me/alan_sport_uz",
  telegramUser: "@alan_sport_uz",
  instagram: "https://www.instagram.com/kurbanov____888/",
  instagramUser: "@kurbanov____888",
  mapEmbed:
    "https://yandex.ru/map-widget/v1/?lang=ru_RU&scroll=true&mode=search&text=%D0%91%D1%83%D1%85%D0%B0%D1%80%D0%B0%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%A5%D0%B0%D1%84%D0%B8%D0%B7%D0%B0%20%D0%A2%D0%B0%D0%BD%D0%B8%D1%88%D0%B0%20%D0%91%D1%83%D1%85%D0%B0%D1%80%D0%B8%2C%2010&z=17",
};

export const NAV = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/katalog", label: "Katalog" },
  { href: "/about", label: "Biz haqimizda" },
  { href: "/contacts", label: "Bog'lanish" },
] as const;

export type CategoryKey = "krossovkalar" | "kiyimlar" | "anjomlar" | "aksessuarlar";

export type CategoryItem = {
  key: CategoryKey;
  label: string;
  desc: string;
  image: string;
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    key: "krossovkalar",
    label: "Krossovkalar",
    desc: "Oyoq kiyimlar • 39–45 o'lchamlar",
    image:
      "https://images.pexels.com/photos/17918935/pexels-photo-17918935.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  },
  {
    key: "kiyimlar",
    label: "Sport kiyimlari",
    desc: "Futbolka, kostyum, hudi • S–XXL",
    image:
      "https://images.pexels.com/photos/5604029/pexels-photo-5604029.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    key: "anjomlar",
    label: "Sport anjomlari",
    desc: "Gantel, to'p, qo'lqop va boshqalar",
    image:
      "https://images.pexels.com/photos/35567437/pexels-photo-35567437.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    key: "aksessuarlar",
    label: "Aksessuarlar",
    desc: "Sumka, kepka va qo'shimchalar",
    image:
      "https://images.pexels.com/photos/13876038/pexels-photo-13876038.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

// Для совместимости со старым кодом
export const CATEGORIES = DEFAULT_CATEGORIES;

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  krossovkalar: "Krossovkalar",
  kiyimlar: "Sport kiyimlari",
  anjomlar: "Sport anjomlari",
  aksessuarlar: "Aksessuarlar",
};

export const SHOE_SIZES = ["39", "40", "41", "42", "43", "44", "45"];
export const CLOTH_SIZES = ["S", "M", "L", "XL", "XXL"];

export function formatPrice(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function orderMessage(productName: string, price?: number): string {
  const pricePart = price ? ` (${formatPrice(price)} so'm)` : "";
  return `Assalomu alaykum! Men ushbu mahsulotni sotib olmoqchiman: ${productName}${pricePart}`;
}

const globalForSettings = globalThis as typeof globalThis & {
  __alanSettings?: { heroImage: string; heroTitle: string; heroDesc: string };
};

const DEFAULT_SETTINGS = {
  heroImage: "/images/hero.jpg",
  heroTitle: "Sifatli va hamyonbop sport tovarlari",
  heroDesc: "Kuch. Tezlik. Uslub. Buxorodagi eng keng assortimentli sport do'koni.",
};

if (!globalForSettings.__alanSettings) {
  globalForSettings.__alanSettings = DEFAULT_SETTINGS;
}

export function getSettings() {
  return globalForSettings.__alanSettings || DEFAULT_SETTINGS;
}

export function setSettings(data: Partial<typeof DEFAULT_SETTINGS>) {
  globalForSettings.__alanSettings = {
    ...globalForSettings.__alanSettings,
    ...data,
  } as any;
}

const globalForImages = globalThis as typeof globalThis & {
  __alanImageStore?: Map<string, { buffer: Buffer; contentType: string }>;
};

if (!globalForImages.__alanImageStore) {
  globalForImages.__alanImageStore = new Map();
}

export function saveImageToStore(filename: string, buffer: Buffer, contentType: string) {
  globalForImages.__alanImageStore?.set(filename, { buffer, contentType });
}

export function getImageFromStore(filename: string) {
  return globalForImages.__alanImageStore?.get(filename);
}