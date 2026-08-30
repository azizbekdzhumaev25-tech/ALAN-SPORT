"use client";

import { useEffect, useRef, useState } from "react";

export type ImageEditorSettings = {
  rotation: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  brightness: number;
  contrast: number;
};

const DEFAULT_SETTINGS: ImageEditorSettings = {
  rotation: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  brightness: 100,
  contrast: 100,
};

type Props = {
  src: string; // всегда ОРИГИНАЛ (без запечённых эффектов)
  initialSettings?: Partial<ImageEditorSettings>;
  onApply: (dataUrl: string, settings: ImageEditorSettings) => void;
  onCancel: () => void;
};

export default function ImageEditor({ src, initialSettings, onApply, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const baseSrcRef = useRef<string>(src);

  const [ready, setReady] = useState(false);
  const [rotation, setRotation] = useState(initialSettings?.rotation ?? 0);
  const [zoom, setZoom] = useState(initialSettings?.zoom ?? 1);
  const [offsetX, setOffsetX] = useState(initialSettings?.offsetX ?? 0);
  const [offsetY, setOffsetY] = useState(initialSettings?.offsetY ?? 0);
  const [brightness, setBrightness] = useState(initialSettings?.brightness ?? 100);
  const [contrast, setContrast] = useState(initialSettings?.contrast ?? 100);
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const CROP = 600;

  useEffect(() => {
    baseSrcRef.current = src;
    setReady(false);

    const s: ImageEditorSettings = {
      ...DEFAULT_SETTINGS,
      ...initialSettings,
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setRotation(s.rotation);
      setZoom(s.zoom);
      setOffsetX(s.offsetX);
      setOffsetY(s.offsetY);
      setBrightness(s.brightness);
      setContrast(s.contrast);
      setReady(true);
    };
    img.onerror = () => {
      alert("Rasmni yuklab bo'lmadi");
      onCancel();
    };
    img.src = src;
  }, [src]); // settings подставляем при открытии через key в родителе

  function draw(
    rot = rotation,
    z = zoom,
    ox = offsetX,
    oy = offsetY,
    br = brightness,
    ct = contrast
  ) {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CROP;
    canvas.height = CROP;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "none";

    ctx.fillStyle = "#111112";
    ctx.fillRect(0, 0, CROP, CROP);

    ctx.save();
    ctx.translate(CROP / 2 + ox, CROP / 2 + oy);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(z, z);
    ctx.filter = `brightness(${br}%) contrast(${ct}%)`;

    const iw = img.width;
    const ih = img.height;
    const base = Math.max(CROP / iw, CROP / ih);
    const dw = iw * base;
    const dh = ih * base;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    ctx.filter = "none";
  }

  useEffect(() => {
    if (!ready) return;
    draw();
  }, [ready, rotation, zoom, offsetX, offsetY, brightness, contrast]);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffsetX((v) => v + dx);
    setOffsetY((v) => v + dy);
    setLastPos({ x: e.clientX, y: e.clientY });
  }

  function onPointerUp() {
    setDragging(false);
  }

  function rotateLeft() {
    setRotation((r) => (r + 270) % 360);
  }

  function rotateRight() {
    setRotation((r) => (r + 90) % 360);
  }

  function getSettings(): ImageEditorSettings {
    return { rotation, zoom, offsetX, offsetY, brightness, contrast };
  }

  function resetAll() {
    // Полный сброс к ОРИГИНАЛУ этого сеанса (без эффектов)
    setRotation(0);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setBrightness(100);
    setContrast(100);
    requestAnimationFrame(() => {
      draw(0, 1, 0, 0, 100, 100);
    });
  }

  function apply() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    draw(rotation, zoom, offsetX, offsetY, brightness, contrast);

    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      if (!dataUrl || dataUrl.length < 100) {
        alert("Rasmni saqlab bo'lmadi. Qayta urinib ko'ring.");
        return;
      }
      // Отдаём и превью, и настройки — чтобы потом открыть с теми же слайдерами
      onApply(dataUrl, getSettings());
    } catch {
      alert("Rasmni saqlashda xatolik. Boshqa rasm tanlang.");
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-line bg-coal shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h3 className="font-display text-sm font-bold tracking-widest text-gold uppercase">
              Rasm Muharriri (HD Sifat)
            </h3>
            <p className="mt-0.5 text-[10px] text-mute">
              Reset = asl rasm. Qo'llash = effektlarni eslab qoladi (qayta ochsangiz sozlamalar saqlanadi).
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-mute uppercase hover:text-white"
          >
            Yopish
          </button>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[1fr_220px]">
          <div className="relative flex items-center justify-center bg-ink p-3 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full cursor-move touch-none border border-gold/40"
              style={{ width: "min(100%, 420px)", height: "auto", aspectRatio: "1 / 1" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
            {/* Сетка только для глаз, клики не перехватывает */}
            <div className="pointer-events-none absolute inset-3 z-10 border border-gold/40 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-gold/20" />
              <div className="border-r border-b border-gold/20" />
              <div className="border-b border-gold/20" />
              <div className="border-r border-b border-gold/20" />
              <div className="border-r border-b border-gold/20" />
              <div className="border-b border-gold/20" />
              <div className="border-r border-gold/20" />
              <div className="border-r border-gold/20" />
              <div />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[10px] font-bold tracking-widest text-mute uppercase">Aylantirish</p>
              <div className="flex gap-2">
                <button type="button" onClick={rotateLeft} className="flex-1 border border-line bg-panel px-2 py-2 text-xs font-bold uppercase hover:border-gold hover:text-gold">
                  ↺ 90°
                </button>
                <button type="button" onClick={rotateRight} className="flex-1 border border-line bg-panel px-2 py-2 text-xs font-bold uppercase hover:border-gold hover:text-gold">
                  ↻ 90°
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-mute uppercase">Zoom: {zoom.toFixed(2)}x</span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full accent-brand"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-mute uppercase">Yorqinlik: {brightness}%</span>
              <input
                type="range"
                min={50}
                max={150}
                step={1}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="mt-1 w-full accent-brand"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-mute uppercase">Kontrast: {contrast}%</span>
              <input
                type="range"
                min={50}
                max={150}
                step={1}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="mt-1 w-full accent-brand"
              />
            </label>

            <div className="grid gap-2 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  apply();
                }}
                className="bg-brand px-4 py-2.5 font-display text-xs font-bold tracking-widest text-white uppercase hover:bg-flame"
              >
                Qo'llash (Apply)
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetAll();
                }}
                className="border border-line px-4 py-2.5 font-display text-xs font-bold tracking-widest text-mute uppercase hover:border-white hover:text-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel();
                }}
                className="border border-line px-4 py-2.5 font-display text-xs font-bold tracking-widest text-brand uppercase hover:border-brand"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}