"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/site";
import { useShop } from "./ShopContext";
import { useToast } from "./Toast";
import { IconArrowRight, IconClose, IconHeart, IconTelegram } from "./Icons";
import { SITE, orderMessage } from "@/lib/site";

export default function FavoritesDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { favorites, toggleFavorite } = useShop();
  const { toast } = useToast();

  function order(name: string, price: number) {
    const msg = orderMessage(name, price);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(msg)
        .then(() => toast("Xabar nusxalandi — Telegram chatga yuboring!"))
        .catch(() => toast("Telegram ochilmoqda…"));
    }
    window.open(SITE.telegram, "_blank", "noopener");
  }

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-line bg-coal transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Sevimlilar"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase">
            <IconHeart className="h-5 w-5 text-flame" filled />
            Sevimlilar
            <span className="bg-gold px-2 py-0.5 text-xs font-extrabold text-coal">
              {favorites.length}
            </span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-9 w-9 items-center justify-center border border-line text-mute transition hover:border-brand hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center border border-line text-mute">
              <IconHeart className="h-7 w-7" />
            </span>
            <p className="font-display text-lg font-semibold uppercase">Sevimlilar bo'sh</p>
            <p className="text-sm text-mute">
              Yoqqan mahsulotlaringizni saqlab qo'ying — ular shu yerda turadi.
            </p>
            <Link
              href="/katalog"
              onClick={onClose}
              className="mt-2 flex items-center gap-2 bg-brand px-5 py-2.5 font-display text-xs font-semibold tracking-widest uppercase transition hover:bg-flame"
            >
              Katalogga o'tish
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto">
              {favorites.map((p) => (
                <li key={p.id} className="flex gap-3 px-5 py-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-16 w-16 shrink-0 border border-line object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold uppercase">
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gold">
                      {formatPrice(p.price)}
                      <span className="ml-1 text-[10px] font-semibold text-mute">so'm</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => order(p.name, p.price)}
                        aria-label={`${p.name} — buyurtma berish`}
                        className="flex h-8 w-8 items-center justify-center bg-brand text-white transition hover:bg-flame"
                      >
                        <IconTelegram className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(p)}
                        aria-label={`${p.name} — olib tashlash`}
                        className="flex h-8 w-8 items-center justify-center border border-line text-mute transition hover:border-flame hover:text-flame"
                      >
                        <IconClose className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <Link
                href="/katalog"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 border border-line px-5 py-3 font-display text-xs font-semibold tracking-widest uppercase transition hover:border-brand hover:text-brand"
              >
                Yana ko'rish <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
