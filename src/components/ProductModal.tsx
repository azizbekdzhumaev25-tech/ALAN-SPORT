"use client";

import { useEffect, useState } from "react";
import type { ProductItem } from "@/lib/products";
import { CATEGORY_LABELS, SITE, formatPrice, type CategoryKey } from "@/lib/site";
import { useToast } from "./Toast";
import { useShop } from "./ShopContext";
import {
  IconClose,
  IconHeart,
  IconPhone,
  IconTelegram,
  IconTruck,
  IconShield,
} from "./Icons";

export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductItem;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useShop();
  const sizes = (product.sizes ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const fav = isFavorite(product.id);

  const discount = product.oldPrice
    ? Math.max(1, Math.round((1 - product.price / product.oldPrice) * 100))
    : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleOrder() {
    if (sizes.length > 0 && !size) {
      toast("Avval o'lchamni tanlang");
      return;
    }
    const sizePart = size ? `. O'lcham: ${size}` : "";
    const msg = `Assalomu alaykum! Men ushbu mahsulotni sotib olmoqchiman: ${product.name}${sizePart}. Narx: ${formatPrice(product.price)} so'm.`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(msg)
        .then(() => toast("Xabar nusxalandi — Telegram chatga yuboring!"))
        .catch(() => toast("Telegram ochilmoqda…"));
    } else {
      toast("Telegram ochilmoqda…");
    }
    window.open(SITE.telegram, "_blank", "noopener");
  }

  return (
    <div
      className="fixed inset-0 z-[90] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="animate-pop relative grid w-full max-w-4xl overflow-hidden border border-line bg-coal shadow-[0_30px_80px_rgba(0,0,0,0.7)] md:grid-cols-2">
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center border border-line bg-coal/90 text-mute transition hover:border-brand hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>

          <div className="relative h-64 bg-panel2 md:h-full md:min-h-[480px]">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-gold px-2.5 py-1 font-display text-xs font-bold tracking-widest text-coal uppercase">
                -{discount}%
              </span>
            )}
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <p className="font-display text-[11px] font-semibold tracking-[0.25em] text-gold uppercase">
              {CATEGORY_LABELS[product.category as CategoryKey] ?? product.category}
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight font-bold uppercase md:text-3xl">
              {product.name}
            </h2>

            <div className="mt-4 flex items-baseline gap-3">
              <p className="font-display text-3xl font-bold text-gold">
                {formatPrice(product.price)}
                <span className="ml-1 text-sm font-semibold text-mute">so'm</span>
              </p>
              {product.oldPrice && (
                <p className="text-sm font-semibold text-mute line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
            </div>

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-mute">{product.description}</p>
            )}

            {sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold tracking-widest text-mute uppercase">
                  O'lchamni tanlang:
                  {size && <span className="ml-2 text-gold">{size}</span>}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-10 px-2.5 py-2 text-xs font-bold transition ${
                        size === s
                          ? "bg-brand text-white"
                          : "border border-line text-mute hover:border-brand hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-2">
              <button
                onClick={handleOrder}
                className="flex w-full items-center justify-center gap-2 bg-brand px-5 py-3 font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:bg-flame active:scale-[0.99]"
              >
                <IconTelegram className="h-4 w-4" />
                Telegram orqali buyurtma berish
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={SITE.phoneHref}
                  className="flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-display text-xs font-semibold tracking-widest uppercase transition hover:border-gold hover:text-gold"
                >
                  <IconPhone className="h-4 w-4" />
                  Qo'ng'iroq
                </a>
                <button
                  onClick={() => {
                    toggleFavorite(product);
                    toast(fav ? "Sevimlilardan olib tashlandi" : "Sevimlilarga qo'shildi");
                  }}
                  className={`flex items-center justify-center gap-2 border px-4 py-2.5 font-display text-xs font-semibold tracking-widest uppercase transition ${
                    fav
                      ? "border-flame text-flame"
                      : "border-line text-mute hover:border-flame hover:text-flame"
                  }`}
                >
                  <IconHeart className="h-4 w-4" filled={fav} />
                  {fav ? "Saqlangan" : "Sevimlilarga"}
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[11px] font-semibold text-mute">
              <p className="flex items-center gap-2">
                <IconTruck className="h-4 w-4 text-gold" />
                Buxoro bo'ylab tez yetkazib berish
              </p>
              <p className="flex items-center gap-2">
                <IconShield className="h-4 w-4 text-gold" />
                Sifat kafolati
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
