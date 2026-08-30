"use client";

import Link from "next/link";
import type { ProductItem } from "@/lib/products";
import { CATEGORY_LABELS, SITE, formatPrice, orderMessage, type CategoryKey } from "@/lib/site";
import { IconEye, IconHeart, IconTelegram } from "./Icons";
import { useToast } from "./Toast";
import { useShop } from "./ShopContext";

export default function ProductCard({
  product,
  buttonLabel = "Buyurtma berish",
}: {
  product: ProductItem;
  buttonLabel?: string;
}) {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useShop();
  const fav = isFavorite(product.id);
  const sizes = (product.sizes ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const discount = product.oldPrice
    ? Math.max(1, Math.round((1 - product.price / product.oldPrice) * 100))
    : 0;

  function handleOrder() {
    const msg = orderMessage(product.name, product.price);
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
    <article className="group clip-angle flex h-full flex-col border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-brand/70 hover:shadow-[0_16px_40px_rgba(229,9,20,0.18)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-panel2">
        <Link
          href={`/product/${product.id}`}
          aria-label={`${product.name} — batafsil ko'rish`}
          className="block h-full w-full cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="eager"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
            <span className="flex items-center gap-2 border border-gold bg-coal/90 px-3 py-1.5 font-display text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
              <IconEye className="h-4 w-4" />
              Ko'rish
            </span>
          </span>
        </Link>

        <span className="pointer-events-none absolute top-0 left-0 bg-brand px-2.5 py-1 font-display text-[10px] font-semibold tracking-[0.18em] text-white uppercase">
          {CATEGORY_LABELS[product.category as CategoryKey] ?? product.category}
        </span>

        {discount > 0 && (
          <span className="pointer-events-none absolute bottom-2 left-2 bg-gold px-2 py-0.5 font-display text-[10px] font-bold tracking-widest text-coal uppercase z-10 shadow-md">
            -{discount}%
          </span>
        )}

        {/* Custom Promo Tag (Подарок, Акция) */}
        {(product as any).promoTag && (
          <span className="pointer-events-none absolute top-3 left-3 bg-brand px-2.5 py-1 font-display text-[10px] font-bold tracking-widest text-white uppercase z-10 shadow-[0_0_15px_rgba(229,9,20,0.6)]">
            {(product as any).promoTag}
          </span>
        )}

        <button
          onClick={() => {
            toggleFavorite(product);
            toast(fav ? "Sevimlilardan olib tashlandi" : "Sevimlilarga qo'shildi");
          }}
          aria-label={fav ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
          className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center border backdrop-blur transition ${
            fav
              ? "border-flame bg-coal/80 text-flame"
              : "border-line bg-coal/70 text-mute hover:border-flame hover:text-flame"
          }`}
        >
          <IconHeart className="h-4 w-4" filled={fav} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3 md:gap-3 md:p-4">
        <Link
          href={`/product/${product.id}`}
          className="text-left font-display text-sm leading-snug font-semibold tracking-wide text-white uppercase transition hover:text-gold md:text-base line-clamp-2"
        >
          {product.name}
        </Link>

        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sizes.map((s) => (
              <span
                key={s}
                className="border border-line bg-coal px-1 py-0.5 text-[9px] font-bold text-mute md:px-1.5 md:text-[10px]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 md:gap-2">
          <p className="font-display text-base font-bold text-gold md:text-lg">
            {formatPrice(product.price)}
            <span className="ml-1 text-[10px] font-semibold text-mute md:text-xs">so'm</span>
          </p>
          {product.oldPrice && (
            <p className="text-[10px] font-semibold text-mute line-through md:text-xs">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>

        <button
          onClick={handleOrder}
          className="flex w-full items-center justify-center gap-1.5 bg-brand px-2 py-2 font-display text-[10px] font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-flame active:scale-[0.98] md:px-3 md:py-2.5 md:text-xs md:tracking-[0.15em]"
        >
          <IconTelegram className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
          <span className="truncate">{buttonLabel}</span>
        </button>
      </div>
    </article>
  );
}