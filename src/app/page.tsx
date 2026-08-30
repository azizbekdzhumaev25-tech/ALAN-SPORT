import Link from "next/link";
import type { ProductItem } from "@/lib/products";
import { DEFAULT_CATEGORIES, SITE, type CategoryKey } from "@/lib/site";
import { getProducts, getCategories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import {
  IconArrowRight,
  IconBall,
  IconCap,
  IconDumbbell,
  IconPhone,
  IconShield,
  IconShirt,
  IconShoe,
  IconTag,
  IconTelegram,
  IconTruck,
} from "@/components/Icons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_ICONS: Record<CategoryKey, (p: { className?: string }) => React.ReactNode> = {
  krossovkalar: (p) => <IconShoe {...p} />,
  kiyimlar: (p) => <IconShirt {...p} />,
  anjomlar: (p) => <IconDumbbell {...p} />,
  aksessuarlar: (p) => <IconCap {...p} />,
};

const MARQUEE_ITEMS = [
  "Tez yetkazib berish",
  "Yuqori sifat",
  "Hamyonbop narxlar",
  "Buxoro • Xafiz Tanish Buxori 10",
  "Har kuni 09:00 – 23:00",
  "Keng assortiment",
  "Telegram orqali buyurtma",
];

function Marquee() {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {MARQUEE_ITEMS.map((item) => (
        <span
          key={`${key}-${item}`}
          className="flex items-center gap-6 pr-6 font-display text-xs font-semibold tracking-[0.3em] whitespace-nowrap text-gold uppercase md:text-sm"
        >
          {item}
          <IconBall className="h-3.5 w-3.5 text-brand" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-b border-line bg-ink py-3" aria-hidden>
      <div className="animate-marquee flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const allProducts = getProducts();
  const savedCategories = getCategories();
  const CATEGORIES = savedCategories.length > 0 ? savedCategories : DEFAULT_CATEGORIES;

  let featured: ProductItem[] = allProducts.filter((p) => p.featured);
  // Товары, явно выбранные в админке для блока "Yangi Kelganlar"
  let newArrivals: ProductItem[] = allProducts.filter((p) => (p as any).isNew);
  // Если в админке ничего не выбрано, покажем первые 6 по умолчанию
  if (newArrivals.length === 0) {
    newArrivals = [...allProducts].slice(0, 6);
  }

  const counts: Record<string, number> = {};
  for (const p of allProducts) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative flex w-full items-center justify-center overflow-hidden border-b border-line bg-[#8a0209] py-1">
        {/* Фоновый спортивный паттерн */}
        <div className="stripes-red absolute inset-0 opacity-30 pointer-events-none" />
        
        {/* Левая декоративная боковая панель */}
        <div className="absolute left-2 inset-y-0 hidden md:flex flex-col items-center justify-between py-6 z-10 opacity-75 pointer-events-none">
          <div className="h-12 w-0.5 bg-gradient-to-b from-transparent via-gold to-brand" />
          <span className="-rotate-90 font-display text-[9px] font-black tracking-[0.35em] text-gold uppercase whitespace-nowrap">
            BUXORO • SPORT
          </span>
          <div className="h-12 w-0.5 bg-gradient-to-b from-brand via-gold to-transparent" />
        </div>

        {/* Правая декоративная боковая панель */}
        <div className="absolute right-2 inset-y-0 hidden md:flex flex-col items-center justify-between py-6 z-10 opacity-75 pointer-events-none">
          <div className="h-12 w-0.5 bg-gradient-to-b from-transparent via-gold to-brand" />
          <span className="rotate-90 font-display text-[9px] font-black tracking-[0.35em] text-gold uppercase whitespace-nowrap">
            ORIGINAL PRODUCTS
          </span>
          <div className="h-12 w-0.5 bg-gradient-to-b from-brand via-gold to-transparent" />
        </div>

        {/* Затемнения по боковым краям экрана */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-ink/90 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-ink/90 to-transparent pointer-events-none z-10" />

        {/* Баннер */}
        <img
          src="/images/hero.jpg"
          alt="ALAN SPORT banner"
          loading="eager"
          className="relative z-0 block h-auto w-[90%] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
        />
      </section>

      <Marquee />

      {/* ============ CATEGORIES ============ */}
      <section className="relative w-full border-b border-line bg-coal/50 backdrop-blur-sm py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                Kategoriyalar
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase md:text-4xl">
                Kerakli bo'limni tanlang
              </h2>
            </div>
            <Link
              href="/katalog"
              className="hidden items-center gap-2 font-display text-sm font-semibold tracking-widest text-mute uppercase transition hover:text-brand sm:flex"
            >
              Barchasi <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.key} delay={i * 90}>
              <Link
                href={`/katalog?cat=${c.key}`}
                className="group relative block h-56 overflow-hidden border border-line bg-panel"
              >
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-110 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-4">
                  <span className="flex h-10 w-10 items-center justify-center bg-brand text-white transition group-hover:bg-flame">
                    {CATEGORY_ICONS[c.key as CategoryKey] ? (
                      CATEGORY_ICONS[c.key as CategoryKey]({ className: "h-5 w-5" })
                    ) : (
                      <IconShirt className="h-5 w-5" />
                    )}
                  </span>
                  <h3 className="mt-3 truncate font-display text-xl font-semibold tracking-wide uppercase">
                    {c.label}
                  </h3>
                  <p className="mt-1 truncate text-xs font-semibold text-mute">{c.desc}</p>
                  
                  {/* Category Promo Tag */}
                  {(c as any).promoTag && (
                    <p className="mt-3 inline-block bg-brand px-3 py-1 font-display text-[11px] font-black tracking-widest text-white uppercase shadow-[0_0_15px_rgba(229,9,20,0.5)]">
                      {(c as any).promoTag}
                    </p>
                  )}
                  
                  {!((c as any).promoTag) && counts[c.key] ? (
                    <p className="mt-2 inline-block bg-gold px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-coal uppercase">
                      {counts[c.key]} ta mahsulot
                    </p>
                  ) : null}
                </div>
                <span className="absolute top-3 right-3 text-white/0 transition group-hover:text-gold">
                  <IconArrowRight className="h-5 w-5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        </div>
      </section>

      {/* ============ NEW ARRIVALS (YANGI KELGANLAR) ============ */}
      <section className="border-t border-line bg-coal/70 backdrop-blur-sm py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="inline-block bg-brand px-2.5 py-1 font-display text-[10px] font-bold tracking-widest text-white uppercase shadow-[0_0_12px_rgba(229,9,20,0.5)]">
                  NEW 2026
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold uppercase md:text-4xl">
                  Yangi Kelganlar
                </h2>
              </div>
              <Link
                href="/katalog"
                className="flex items-center gap-2 border border-line px-4 py-2 font-display text-xs font-semibold tracking-widest uppercase transition hover:border-brand hover:text-brand"
              >
                Barchasini ko'rish <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          {newArrivals.length > 0 && (
            <div className="mt-8 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-brand scrollbar-track-coal">
              {newArrivals.map((p) => (
                <div key={`new-${p.id}`} className="w-[160px] shrink-0 sm:w-64 md:w-72">
                  <ProductCard product={p} buttonLabel="Buyurtma berish" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ POPULAR PRODUCTS ============ */}
      <section className="relative w-full border-y border-line bg-coal/60 backdrop-blur-sm py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                  Tanlov
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold uppercase md:text-4xl">
                  Ommabop mahsulotlar
                </h2>
              </div>
              <Link
                href="/katalog"
                className="flex items-center gap-2 border border-line px-4 py-2 font-display text-xs font-semibold tracking-widest uppercase transition hover:border-brand hover:text-brand"
              >
                Barchasini ko'rish <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          {featured.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 80} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-line bg-panel p-10 text-center">
              <p className="font-display text-lg font-semibold uppercase">
                Tez orada yangi mahsulotlar qo'shiladi
              </p>
              <Link
                href="/katalog"
                className="mt-3 inline-block text-sm font-bold text-brand hover:text-flame"
              >
                Katalogni ko'rish
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============ ADVANTAGES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-20">
        <Reveal>
          <p className="font-display text-[10px] md:text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            Afzalliklar
          </p>
          <h2 className="mt-1.5 md:mt-2 font-display text-xl font-bold uppercase md:text-4xl">
            Nega aynan ALAN SPORT?
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-5 md:mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
            {[
              {
                icon: <IconTruck className="h-5 w-5 md:h-6 md:w-6" />,
                title: "Tez yetkazib berish",
                text: "Buxoro shahri bo'ylab buyurtmalaringizni qisqa vaqtda, xavfsiz va o'z vaqtida yetkazib beramiz.",
              },
              {
                icon: <IconShield className="h-5 w-5 md:h-6 md:w-6" />,
                title: "Yuqori sifat",
                text: "Mahsulotlarimiz doimiy nazoratdan o'tadi — faqat ishonchli va sinovdan o'tgan brendlar.",
              },
              {
                icon: <IconTag className="h-5 w-5 md:h-6 md:w-6" />,
                title: "Hamyonbop narxlar",
                text: "Bozordagi eng qulay narxlar, muntazam chegirmalar va doimiy mijozlar uchun bonuslar.",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="group flex gap-3 bg-coal p-3.5 transition hover:bg-panel sm:block sm:p-5 md:p-8"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-white transition group-hover:bg-gold group-hover:text-coal md:h-12 md:w-12">
                  {a.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold tracking-wide uppercase md:mt-4 md:text-lg">
                    {a.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-snug text-mute md:mt-2 md:text-sm md:leading-relaxed">
                    {a.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="stripes-red border-t border-line bg-brand">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 md:flex-row md:items-center md:py-12">
          <Reveal>
            <h2 className="font-display text-2xl font-bold uppercase md:text-3xl">
              Savolingiz bormi?
            </h2>
            <p className="mt-2 max-w-xl text-sm font-semibold text-white/85">
              Telegram orqali yozing — mahsulot tanlashda yordam beramiz, narx va o'lchamlar
              bo'yicha tez javob beramiz.
            </p>
          </Reveal>
          <div className="flex flex-wrap gap-3">
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 bg-coal px-6 py-3 font-display text-sm font-semibold tracking-widest uppercase ring-1 ring-gold/60 transition hover:ring-gold"
            >
              <IconTelegram className="h-4 w-4 text-gold" />
              Telegramga yozish
            </a>
            <a
              href={SITE.phoneHref}
              className="flex items-center gap-2 border-2 border-white/70 px-6 py-[10px] font-display text-sm font-semibold tracking-widest uppercase transition hover:border-white hover:bg-white hover:text-brand"
            >
              <IconPhone className="h-4 w-4" />
              Qo'ng'iroq qilish
            </a>
          </div>
        </div>
      </section>
    </>
  );
}