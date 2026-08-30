"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
  discount,
}: {
  images: string[];
  alt: string;
  discount?: number;
}) {
  const list = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const current = list[active] || list[0];

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center border border-line bg-panel2 text-sm text-mute">
        Rasm yo'q
      </div>
    );
  }

  const prevImage = () => {
    setActive((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActive((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative overflow-hidden border border-line bg-panel">
        {/* Главное фото с кликом во весь экран */}
        <div className="relative aspect-square cursor-zoom-in bg-panel2" onClick={() => setIsZoomed(true)}>
          <img src={current} alt={alt} className="h-full w-full object-cover transition duration-300 hover:scale-105" />

          {/* Процент скидки */}
          {!!discount && discount > 0 && (
            <span className="absolute top-4 left-4 bg-gold px-3 py-1 font-display text-xs font-bold tracking-widest text-coal uppercase z-10">
              -{discount}%
            </span>
          )}

          {/* Счётчик фото (например 1 / 4) */}
          {list.length > 1 && (
            <span className="absolute top-4 right-4 bg-coal/80 backdrop-blur border border-line px-2.5 py-1 text-[11px] font-bold tracking-widest text-gold uppercase z-10">
              {active + 1} / {list.length}
            </span>
          )}

          {/* Стрелки переключения фото на самом баннере */}
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-line bg-coal/80 text-white backdrop-blur transition hover:border-gold hover:text-gold z-10"
              >
                ❮
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-line bg-coal/80 text-white backdrop-blur transition hover:border-gold hover:text-gold z-10"
              >
                ❯
              </button>
            </>
          )}
        </div>

        {/* Миниатюры всех доступных фото снизу */}
        {list.length > 1 && (
          <div className="grid grid-cols-4 gap-2 border-t border-line bg-coal p-3 sm:grid-cols-5">
            {list.map((src, i) => (
              <button
                key={`${i}-${src.slice(0, 20)}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative overflow-hidden border transition ${
                  active === i ? "border-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]" : "border-line opacity-60 hover:opacity-100"
                }`}
              >
                <img src={src} alt={`${alt} ${i + 1}`} className="h-16 w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Просмотр во весь экран (Full HD Lightbox) */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-2xl font-bold text-white hover:text-gold"
          >
            ✕ Yopish
          </button>

          <img src={current} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />

          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-white hover:text-gold"
              >
                ❮
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl text-white hover:text-gold"
              >
                ❯
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}