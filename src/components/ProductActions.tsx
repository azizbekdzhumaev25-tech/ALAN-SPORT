"use client";

import { useState } from "react";
import type { ProductItem } from "@/lib/products";
import { SITE, formatPrice } from "@/lib/site";
import { useShop } from "@/components/ShopContext";
import { useToast } from "@/components/Toast";
import { IconHeart, IconPhone, IconTelegram } from "@/components/Icons";

export default function ProductActions({
  product,
  sizes,
}: {
  product: ProductItem;
  sizes: string[];
}) {
  const { isFavorite, toggleFavorite } = useShop();
  const { toast } = useToast();
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const fav = isFavorite(product.id);

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
    <div className="space-y-5">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest text-mute uppercase">
            O'lchamni tanlang:
            {size && <span className="ml-2 text-gold">{size}</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-11 px-3 py-2 text-xs font-bold transition ${
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

      <div className="grid gap-2">
        <button
          type="button"
          onClick={handleOrder}
          className="flex w-full items-center justify-center gap-2 bg-brand px-5 py-3.5 font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:bg-flame"
        >
          <IconTelegram className="h-4 w-4" />
          Telegram orqali buyurtma berish
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={SITE.phoneHref}
            className="flex items-center justify-center gap-2 border border-line px-4 py-3 font-display text-xs font-semibold tracking-widest uppercase transition hover:border-gold hover:text-gold"
          >
            <IconPhone className="h-4 w-4" />
            Qo'ng'iroq
          </a>

          <button
            type="button"
            onClick={() => {
              toggleFavorite(product);
              toast(fav ? "Sevimlilardan olib tashlandi" : "Sevimlilarga qo'shildi");
            }}
            className={`flex items-center justify-center gap-2 border px-4 py-3 font-display text-xs font-semibold tracking-widest uppercase transition ${
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
    </div>
  );
}