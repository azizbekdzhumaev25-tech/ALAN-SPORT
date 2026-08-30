"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV, SITE } from "@/lib/site";
import {
  IconClock,
  IconClose,
  IconHeart,
  IconMapPin,
  IconMenu,
  IconSearch,
  IconTelegram,
} from "./Icons";
import { useShop } from "./ShopContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { favorites, openFavorites } = useShop();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    // Har doim toza URL bilan katalogga o'tamiz
    if (term) {
      router.push(`/katalog?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/katalog");
    }
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-coal/95 backdrop-blur">
      {/* top info strip */}
      <div className="hidden border-b border-line/60 bg-ink md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-mute">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <IconMapPin className="h-3.5 w-3.5 text-gold" />
              {SITE.address}
            </span>
            <span className="flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5 text-gold" />
              {SITE.hours}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Иконки убраны */}
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 md:py-3">
        <Link href="/" className="shrink-0" aria-label="ALAN SPORT — bosh sahifa">
          <span className="font-display text-2xl font-black italic tracking-wider text-white">
            ALAN <span className="text-brand">SPORT</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 px-3 py-2 font-display text-sm font-semibold tracking-widest uppercase transition ${
                  active
                    ? "border-brand text-white"
                    : "border-transparent text-mute hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <form onSubmit={submitSearch} className="relative hidden md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mahsulot qidirish…"
              className="w-44 border border-line bg-panel py-2 pr-3 pl-9 text-sm text-white placeholder-mute/70 transition outline-none focus:border-brand lg:w-56"
            />
            <button
              type="submit"
              aria-label="Qidirish"
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-mute transition hover:text-brand"
            >
              <IconSearch className="h-4 w-4" />
            </button>
          </form>

          {/* Telefon olib tashlandi */}

          <button
            onClick={openFavorites}
            aria-label={`Sevimlilar (${favorites.length})`}
            className="relative flex h-11 w-11 md:h-10 md:w-10 items-center justify-center border border-line text-mute transition hover:border-flame hover:text-flame"
          >
            <IconHeart className="h-5 w-5" filled={favorites.length > 0} />
            {favorites.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-coal">
                {favorites.length}
              </span>
            )}
          </button>

          <a
            href={SITE.telegram}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 bg-brand px-4 py-2 font-display text-sm font-semibold tracking-widest uppercase transition hover:bg-flame sm:flex"
          >
            <IconTelegram className="h-4 w-4" />
            Telegram
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            className="flex h-11 w-11 md:h-10 md:w-10 items-center justify-center border border-line text-white transition hover:border-brand lg:hidden"
          >
            {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile panel */}
      {open && (
        <div className="animate-rise border-t border-line bg-coal lg:hidden">
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
            <form onSubmit={submitSearch} className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Mahsulot qidirish…"
                className="w-full border border-line bg-panel py-2.5 pr-3 pl-10 text-sm text-white placeholder-mute/70 outline-none focus:border-brand"
              />
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-mute">
                <IconSearch className="h-4 w-4" />
              </span>
            </form>
            <nav className="grid">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`border-l-2 px-3 py-2.5 font-display text-base font-semibold tracking-widest uppercase ${
                    pathname === item.href
                      ? "border-brand bg-panel text-white"
                      : "border-line text-mute"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 bg-brand px-3 py-2 text-sm font-bold text-white"
              >
                <IconTelegram className="h-4 w-4" />
                Telegram
              </a>
            </div>
            <p className="flex items-center gap-2 text-xs text-mute">
              <IconMapPin className="h-3.5 w-3.5 text-gold" />
              {SITE.address} • {SITE.hours}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
