"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ProductItem } from "@/lib/products";
import { CATEGORIES, CLOTH_SIZES, SHOE_SIZES } from "@/lib/site";
import ProductCard from "./ProductCard";
import { IconAlert, IconBall, IconClose, IconRefresh, IconSearch, IconSort } from "./Icons";

const ALL_SIZES = [...SHOE_SIZES, ...CLOTH_SIZES];

type SortKey = "default" | "price-asc" | "price-desc" | "name";

export default function CatalogClient() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [size, setSize] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("default");

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const data = (await res.json()) as ProductItem[];
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function readUrlAndLoad() {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("cat");
      if (c && CATEGORIES.some((x) => x.key === c)) {
        setCat(c);
      } else {
        setCat("all");
      }

      const term = params.get("q");
      setQ(term ? term : "");

      void load();
    }

    readUrlAndLoad();

    // Brauzer orqaga/oldinga bosganda ham qidiruv ishlasin
    window.addEventListener("popstate", readUrlAndLoad);
    return () => window.removeEventListener("popstate", readUrlAndLoad);
  }, [load]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const arr = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      if (size) {
        const sizes = (p.sizes ?? "").split(",").map((s) => s.trim());
        if (!sizes.includes(size)) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "name":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        arr.sort((a, b) => a.id - b.id);
    }
    return arr;
  }, [products, cat, q, size, sort]);

  const hasFilters = cat !== "all" || q.trim() !== "" || size !== null;

  function reset() {
    setCat("all");
    setQ("");
    setSize(null);
    setSort("default");
  }

  return (
    <>
      {/* page head */}
      <section 
        className="relative w-full border-b border-line bg-cover bg-center bg-no-repeat py-10 md:py-14"
        style={{ backgroundImage: "linear-gradient(to right, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.75) 50%, rgba(11,11,12,0.88) 100%), url('/images/catalog-header-bg.jpg')" }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <p className="text-xs font-semibold tracking-widest text-mute uppercase">
            <Link href="/" className="transition hover:text-gold">Bosh sahifa</Link>
            <span className="mx-2 text-brand">/</span>
            <span className="text-gold">Katalog</span>
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold uppercase md:text-5xl">
            Katalog
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-mute md:text-base">
            Barcha sport tovarlari bir joyda — o'zingizga yoqqan mahsulotni tanlang,
            sevimlilarga qo'shing va Telegram orqali buyurtma bering.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        {/* filters */}
        <div className="space-y-4 border border-line bg-panel p-4 md:p-5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setCat("all")}
              className={`px-4 py-2 font-display text-xs font-semibold tracking-widest uppercase transition ${
                cat === "all"
                  ? "bg-brand text-white"
                  : "border border-line text-mute hover:border-brand hover:text-white"
              }`}
            >
              Barchasi
              <span className={`ml-1.5 ${cat === "all" ? "text-white/70" : "text-gold"}`}>
                {products.length || ""}
              </span>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`px-4 py-2 font-display text-xs font-semibold tracking-widest uppercase transition ${
                  cat === c.key
                    ? "bg-brand text-white"
                    : "border border-line text-mute hover:border-brand hover:text-white"
                }`}
              >
                {c.label}
                <span className={`ml-1.5 ${cat === c.key ? "text-white/70" : "text-gold"}`}>
                  {counts[c.key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Mahsulot nomi bo'yicha qidirish…"
                className="w-full border border-line bg-coal py-2.5 pr-10 pl-4 text-sm text-white placeholder-mute/70 outline-none focus:border-brand"
              />
              {q ? (
                <button
                  onClick={() => setQ("")}
                  aria-label="Qidiruvni tozalash"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-mute transition hover:text-brand"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              ) : (
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-mute">
                  <IconSearch className="h-4 w-4" />
                </span>
              )}
            </div>

            <label className="flex items-center gap-2">
              <IconSort className="h-4 w-4 text-gold" />
              <span className="sr-only">Saralash</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="cursor-pointer border border-line bg-coal px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-brand"
              >
                <option value="default">Tavsiya etilgan</option>
                <option value="price-asc">Narx: arzon → qimmat</option>
                <option value="price-desc">Narx: qimmat → arzon</option>
                <option value="name">Nomi bo'yicha (A–Z)</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <span className="mr-1 shrink-0 font-display text-xs font-semibold tracking-widest text-gold uppercase">
              O'lcham:
            </span>
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize((prev) => (prev === s ? null : s))}
                className={`min-w-9 px-2 py-1.5 text-xs font-bold transition ${
                  size === s
                    ? "bg-gold text-coal"
                    : "border border-line text-mute hover:border-gold hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
            {size && (
              <button
                onClick={() => setSize(null)}
                className="ml-1 text-xs font-bold tracking-wider text-brand uppercase transition hover:text-flame"
              >
                Bekor qilish
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-xs font-semibold tracking-wider text-mute uppercase" aria-live="polite">
              {loading ? "Yuklanmoqda…" : `${filtered.length} ta mahsulot topildi`}
            </p>
            {hasFilters && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-brand uppercase transition hover:text-flame"
              >
                <IconClose className="h-3.5 w-3.5" />
                Filtrlarni tozalash
              </button>
            )}
          </div>
        </div>

        {/* results */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="clip-angle border border-line bg-panel">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="space-y-3 p-4">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-9 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-brand/50 bg-panel p-10 text-center">
              <IconAlert className="mx-auto h-10 w-10 text-brand" />
              <p className="mt-4 font-display text-lg font-semibold uppercase">
                Ma'lumotlarni yuklab bo'lmadi
              </p>
              <p className="mt-2 text-sm text-mute">
                Internet aloqasini tekshiring va qayta urinib ko'ring.
              </p>
              <button
                onClick={() => void load()}
                className="mt-5 inline-flex items-center gap-2 bg-brand px-5 py-2.5 font-display text-xs font-semibold tracking-widest uppercase transition hover:bg-flame"
              >
                <IconRefresh className="h-4 w-4" />
                Qayta urinish
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-line bg-panel p-10 text-center">
              <IconBall className="mx-auto h-10 w-10 text-mute" />
              <p className="mt-4 font-display text-lg font-semibold uppercase">
                Hech narsa topilmadi
              </p>
              <p className="mt-2 text-sm text-mute">
                Boshqa kategoriyani yoki o'lchamni tanlab ko'ring.
              </p>
              <button
                onClick={reset}
                className="mt-5 inline-flex items-center gap-2 border border-brand px-5 py-2.5 font-display text-xs font-semibold tracking-widest text-brand uppercase transition hover:bg-brand hover:text-white"
              >
                <IconClose className="h-4 w-4" />
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} buttonLabel="Telegram orqali sotib olish" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
