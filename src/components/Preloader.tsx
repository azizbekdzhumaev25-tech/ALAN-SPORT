"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/site";

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Мгновенный запуск
    setTimeout(() => {
      if (isMounted) setFadeIn(true);
    }, 10);

    async function startPreload() {
      // 1. Статичные важные фото
      const staticImages = [
        "/images/hero.jpg",
        "/images/logo.png",
        ...CATEGORIES.map((c) => c.image),
      ];

      // 2. Получаем карточки товаров
      let productImages: string[] = [];
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const products = await res.json();
          if (Array.isArray(products)) {
            productImages = products
              .map((p: { image: string }) => p.image)
              .filter(Boolean);
          }
        }
      } catch {
        /* ignore */
      }

      const allImages = Array.from(new Set([...staticImages, ...productImages]));

      if (allImages.length === 0) {
        finish();
        return;
      }

      let loadedCount = 0;
      const total = allImages.length;

      const onItemDone = () => {
        loadedCount++;
        if (isMounted) {
          const pct = Math.round((loadedCount / total) * 100);
          setProgress(pct);
        }
        if (loadedCount >= total) {
          // Задержка 200мс, чтобы браузер успел отрисовать кэш
          setTimeout(() => {
            finish();
          }, 200);
        }
      };

      allImages.forEach((src) => {
        if (src.startsWith("data:")) {
          onItemDone();
        } else {
          const img = new Image();
          img.src = src;
          img.onload = onItemDone;
          img.onerror = onItemDone;
        }
      });

      // Резервный таймер
      setTimeout(() => {
        if (isMounted && loadedCount < total) {
          finish();
        }
      }, 4000);
    }

    function finish() {
      if (!isMounted) return;
      setFadeOut(true);
      setTimeout(() => {
        if (isMounted) setLoaded(true);
      }, 400);
    }

    startPreload();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loaded) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0b0b0c] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Спортивный фоновый рисунок с молниеносным проявлением */}
      <img
        src="/images/preload-bg.jpg"
        alt="Preloader BG"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-250 ease-out ${
          fadeIn ? "opacity-70" : "opacity-0"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c]/90 via-black/30 to-[#0b0b0c]/90" />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Анимированный логотип */}
        <div className="font-display text-4xl font-black italic tracking-wider text-white md:text-5xl animate-pulse drop-shadow-[0_0_25px_rgba(229,9,20,0.6)]">
          ALAN <span className="text-[#e50914]">SPORT</span>
        </div>

        {/* Прогресс-бар */}
        <div className="mt-6 h-2 w-64 overflow-hidden rounded-full bg-[#1e1e22] p-0.5 border border-line">
          <div
            className="h-full bg-gradient-to-r from-[#e50914] via-[#d4af37] to-[#e50914] transition-all duration-200 rounded-full"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>

        <p className="mt-3 font-display text-xs font-bold tracking-[0.3em] text-[#d4af37] uppercase">
          Rasmlar yuklanmoqda... {progress}%
        </p>
      </div>
    </div>
  );
}