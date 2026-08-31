"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES, formatPrice } from "@/lib/site";
import { IconArrowRight, IconEye, IconEyeOff, IconRefresh, IconSearch } from "@/components/Icons";
import ImageEditor from "@/components/ImageEditor";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  description: string;
  sizes?: string | null;
  image: string;
  featured: boolean;
};

function formatNumberInput(val: string) {
  const clean = val.replace(/\D/g, "");
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// === Без серверов/БД: смена пароля хранится в файле data/admin.json + localStorage (клиент сам меняет) ===
const CUSTOM_PASS_KEY = "alan-custom-pass-hash";
const PASS_SALT = "alan-sport-2026-salt-v1";

async function hashClientPassword(pwd: string): Promise<string> {
  const data = new TextEncoder().encode(pwd + PASS_SALT);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCustomHash(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOM_PASS_KEY);
}
function setCustomHash(hash: string) {
  if (typeof window !== "undefined") localStorage.setItem(CUSTOM_PASS_KEY, hash);
}
function clearCustomHash() {
  if (typeof window !== "undefined") localStorage.removeItem(CUSTOM_PASS_KEY);
}

// Умное сжатие фото (100% гарантия идеального отображения без ошибок 404)
function compressAndConvertImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1400; // Повышено до HD разрешения

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.93)); // Высшее качество 93%
        } else {
          reject(new Error("Canvas error"));
        }
      };
      img.onerror = () => reject(new Error("Image error"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Reader error"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("krossovkalar");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState("39,40,41,42,43");
  const [promoTag, setPromoTag] = useState("");
  const [image, setImage] = useState(""); // главная
  const [images, setImages] = useState<string[]>([]); // галерея
  const [uploading, setUploading] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState(""); // оригинал для редактора
  const [editorSettings, setEditorSettings] = useState<{
    rotation: number;
    zoom: number;
    offsetX: number;
    offsetY: number;
    brightness: number;
    contrast: number;
  } | null>(null);
  // По каждой фотке в галерее: оригинал + последние настройки слайдеров
  const [imageMeta, setImageMeta] = useState<
    Record<
      number,
      {
        original: string;
        settings: {
          rotation: number;
          zoom: number;
          offsetX: number;
          offsetY: number;
          brightness: number;
          contrast: number;
        };
      }
    >
  >({});
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "newArrivals" | "security">("products");
  const [categories, setCategories] = useState<any[]>([]);
  const [catUploadingKey, setCatUploadingKey] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  // Смена пароля — без серверов/БД (localStorage + файл)
  const [oldPassInput, setOldPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [passChangeMsg, setPassChangeMsg] = useState("");
  const [hasCustomPass, setHasCustomPass] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Загружаем данные только пока открыта активная сессия в памяти
  useEffect(() => {
    if (!authed) return;
    loadProducts();
    loadCategories();
    loadSettings();
  }, [authed]);

  // Проверяем есть ли кастомный пароль (без серверов — localStorage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const h = localStorage.getItem(CUSTOM_PASS_KEY);
      setHasCustomPass(!!h);
    }
    // также спросим сервер есть ли файл
    fetch("/api/admin/password").then(r=>r.json()).then(d=>{ if(d.hasCustom) setHasCustomPass(true)}).catch(()=>{});
  }, [authed]);

  // Максимальная безопасность: Мгновенный выход при переключении/покидании вкладки
  useEffect(() => {
    if (!authed) return;

    function handleVisibility() {
      if (document.hidden) {
        logout();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    // 1) Сначала пробуем кастомный пароль из браузера (без бекенда)
    const customHash = getCustomHash();
    if (customHash) {
      try {
        const h = await hashClientPassword(pass);
        if (h === customHash) {
          // Пробуем получить серверный токен с этим же паролем (если файл еще жив)
          try {
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: pass }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem("alan-admin-token");
                window.sessionStorage.removeItem("alan-admin-token");
              }
              setAdminToken(data.token);
              setAuthed(true);
              setPass("");
              return;
            }
          } catch {}
          // Сервер не знает новый пароль (файл сбросился после рестарта Netlify) — пускаем в админку без сервера
          // Генерируем локальный токен, API будет работать в offline-режиме (покажем предупреждение)
          const localToken = `local-${Date.now()}-${customHash.slice(0,8)}`;
          setAdminToken(localToken);
          setAuthed(true);
          setPass("");
          setMsg("⚠️ Kirish local parol bilan (serverda eski parol) — yangilash uchun parolni qayta o'rnating");
          setTimeout(()=>setMsg(""), 4000);
          return;
        }
      } catch {}
    }
    // 2) Обычный серверный логин (env или data/admin.json)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        if (res.status === 429) {
          alert(data.error || "Juda ko'p urinishlar. 15 daqiqa kuting.");
        } else {
          alert("Parol noto'g'ri!");
        }
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("alan-admin-token");
        window.sessionStorage.removeItem("alan-admin-token");
      }
      setAdminToken(data.token);
      setAuthed(true);
      setPass("");
    } catch {
      alert("Serverga ulanib bo'lmadi");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassChangeMsg("");
    if (!oldPassInput || !newPassInput || !confirmPassInput) {
      setPassChangeMsg("❌ Barcha maydonlarni to'ldiring");
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassChangeMsg("❌ Yangi parollar mos emas");
      return;
    }
    if (newPassInput.length < 6) {
      setPassChangeMsg("❌ Kamida 6 ta belgi");
      return;
    }
    if (oldPassInput === newPassInput) {
      setPassChangeMsg("❌ Eski va yangi bir xil bo'lmasin");
      return;
    }
    // Проверяем старый пароль: сначала localStorage, потом сервер
    let oldOk = false;
    const customHash = getCustomHash();
    if (customHash) {
      try { const h = await hashClientPassword(oldPassInput); if (h === customHash) oldOk = true; } catch {}
    }
    if (!oldOk) {
      try {
        const r = await fetch("/api/admin/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({password: oldPassInput}) });
        if (r.ok) { const d=await r.json(); if(d.token) oldOk = true; }
      } catch {}
    }
    if (!oldOk) {
      setPassChangeMsg("❌ Eski parol noto'g'ri");
      return;
    }
    // Пытаемся сохранить на сервере (файл data/admin.json) — без внешних БД
    let serverOk = false;
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ oldPassword: oldPassInput, newPassword: newPassInput }),
      });
      const d = await res.json();
      if (res.ok && d.ok) serverOk = true;
      else if (res.status === 401) { /* токен local — пропустим */ }
      else if (!res.ok) { setPassChangeMsg("⚠️ Serverda saqlanmadi: " + (d.error||"")); }
    } catch {}
    // Сохраняем в браузере (без серверов и без бекенда — чисто localStorage)
    try {
      const newHash = await hashClientPassword(newPassInput);
      setCustomHash(newHash);
      setHasCustomPass(true);
    } catch {}
    setOldPassInput(""); setNewPassInput(""); setConfirmPassInput("");
    if (serverOk) {
      setPassChangeMsg("✅ Parol o'zgartirildi (server + brauzer) — yangi parol bilan kiring");
    } else {
      setPassChangeMsg("✅ Parol brauzerda o'zgartirildi (local) — serverda eski parol qoldi. Keyingi safar local parol bilan kirasiz");
    }
    setTimeout(()=>setPassChangeMsg(""), 5000);
  }

  function handleResetPass() {
    if (!confirm("Parolni asl holiga qaytarasizmi? (env paroliga)")) return;
    clearCustomHash();
    setHasCustomPass(false);
    setPassChangeMsg("♻️ Local parol tozalandi — endi env paroli ishlaydi");
    setTimeout(()=>setPassChangeMsg(""), 3000);
    // пробуем также сбросить серверный файл (если есть доступ)
    fetch("/api/admin/password", { method: "PUT", headers: authHeaders(), body: JSON.stringify({oldPassword: "reset", newPassword: "reset"}) }).catch(()=>{});
  }

  function logout() {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("alan-admin-token");
      window.localStorage.removeItem("alan-admin-token");
    }
    setAdminToken("");
    setAuthed(false);
    setPass("");
    setProducts([]);
    setCategories([]);
    setEditingId(null);
    setName("");
    setPrice("");
    setOldPrice("");
    setDescription("");
    setSizes("39,40,41,42,43");
    setPromoTag("");
    setImages([]);
    setImage("");
    setFeatured(false);
    setIsNew(false);
    setMsg("");
    setEditorOpen(false);
    setEditorSrc("");
    setQ("");
    setActiveTab("products");
  }

  function authHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    };
  }

  function forceLogout() {
    window.sessionStorage.removeItem("alan-admin-token");
    window.localStorage.removeItem("alan-admin-token");
    setAdminToken("");
    setAuthed(false);
    setPass("");
    setMsg("Sessiya tugadi — qayta parol kiriting");
    setTimeout(() => setMsg(""), 3000);
  }

  async function adminFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      forceLogout();
    }
    return res;
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data) {
        if (data.heroTitle) setHeroTitle(data.heroTitle);
        if (data.heroDesc) setHeroDesc(data.heroDesc);
      }
    } catch { /* ignore */ }
  }

  async function handleCategoryImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCatUploadingKey(key);
    try {
      const compressed = await compressAndConvertImage(file);
      setCategories((prev) =>
        prev.map((c) => (c.key === key ? { ...c, image: compressed } : c))
      );
      setMsg("🖼 Kategoriya rasmi yangilandi (saqlashni bosing)");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      alert("Rasm yuklashda xatolik");
    } finally {
      setCatUploadingKey(null);
      e.target.value = "";
    }
  }

  function updateCategoryField(
    key: string,
    field: "label" | "desc" | "image" | "promoTag",
    value: string
  ) {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, [field]: value } : c))
    );
  }

  async function saveCategories() {
    const cleaned = categories.map((c) => ({
      key: c.key,
      label: (c.label || "").trim(),
      desc: (c.desc || "").trim(),
      promoTag: (c.promoTag || "").trim(),
      image: c.image || "",
    }));

    if (cleaned.some((c) => !c.label || !c.image)) {
      alert("Har bir kategoriyada nom va rasm bo'lishi shart!");
      return;
    }

    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ categories: cleaned }),
    });
    if (res.ok) {
      setCategories(cleaned);
      setMsg("✅ Kategoriya matni va rasmlari saqlandi!");
      setTimeout(() => setMsg(""), 2500);
    } else {
      alert("Saqlashda xatolik");
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const selected = Array.from(files);
      const compressedList: string[] = [];

      for (const file of selected) {
        const compressedDataUrl = await compressAndConvertImage(file);
        compressedList.push(compressedDataUrl);
      }

      // Если одно фото — сразу в редактор (оригинал = только что загруженный файл)
      if (compressedList.length === 1) {
        (window as any).__editImageIndex = -1;
        setEditorSrc(compressedList[0]);
        setEditorSettings({
          rotation: 0,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          brightness: 100,
          contrast: 100,
        });
        setEditorOpen(true);
      } else {
        // Несколько фото — сразу в галерею
        setImages((prev) => {
          const next = [...prev, ...compressedList];
          if (!image && next[0]) setImage(next[0]);
          return next;
        });
        setMsg(`🖼 ${compressedList.length} ta rasm qo'shildi`);
        setTimeout(() => setMsg(""), 2000);
      }
    } catch {
      alert("Rasm yuklashda xatolik bo'ldi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function openEditorForImage(src: string, index?: number) {
    if (!src) {
      alert("Avval rasm yuklang!");
      return;
    }
    const idx = typeof index === "number" ? index : -1;
    (window as any).__editImageIndex = idx;

    // Если уже редактировали этот кадр — открываем ОРИГИНАЛ + старые слайдеры
    if (idx >= 0 && imageMeta[idx]) {
      setEditorSrc(imageMeta[idx].original);
      setEditorSettings(imageMeta[idx].settings);
    } else {
      // Первый раз: текущее фото = оригинал, слайдеры по умолчанию
      setEditorSrc(src);
      setEditorSettings({
        rotation: 0,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        brightness: 100,
        contrast: 100,
      });
    }
    setEditorOpen(true);
  }

  function removeImageAt(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next[0]) setImage(next[0]);
      else setImage("");
      return next;
    });
  }

  function setMainImage(index: number) {
    setImages((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      setImage(chosen);
      return next;
    });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setCategory("krossovkalar");
    setPrice("");
    setOldPrice("");
    setDescription("");
    setSizes("39,40,41,42,43");
    setPromoTag("");
    setImages([]);
    setImage("");
    setFeatured(false);
    setIsNew(false);
    setEditorOpen(false);
    setEditorSrc("");
    setEditorSettings(null);
    setImageMeta({});
    (window as any).__editImageIndex = -1;
  }

  function startEdit(p: Product & { images?: string[] }) {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrice(formatNumberInput(String(p.price)));
    setOldPrice(p.oldPrice ? formatNumberInput(String(p.oldPrice)) : "");
    setDescription(p.description || "");
    setSizes(p.sizes || "");
    setPromoTag((p as any).promoTag || "");
    const gallery =
      Array.isArray((p as any).images) && (p as any).images.length > 0
        ? (p as any).images
        : p.image
          ? [p.image]
          : [];
    setImages(gallery);
    setImage(gallery[0] || p.image || "");
    // Старые меты сбрасываем: для уже сохранённых фото оригинал = само фото
    const meta: typeof imageMeta = {};
    gallery.forEach((g: string, i: number) => {
      meta[i] = {
        original: g,
        settings: {
          rotation: 0,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          brightness: 100,
          contrast: 100,
        },
      };
    });
    setImageMeta(meta);
    setFeatured(p.featured);
    setIsNew(Boolean((p as any).isNew));
    // Если товар из NEW — остаёмся / переходим на вкладку Yangi Kelganlar
    if ((p as any).isNew) {
      setActiveTab("newArrivals");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMsg("✏️ Tahrirlash rejimi yoqildi — yuqoridagi formani o'zgartiring");
    setTimeout(() => setMsg(""), 2500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const gallery = images.length > 0 ? images : image ? [image] : [];

    if (!name.trim() || !price || gallery.length === 0) {
      alert("Iltimos, mahsulot nomi, narxi va kamida 1 ta rasm kiriting!");
      return;
    }

    const rawPrice = Number(price.replace(/\s+/g, ""));
    const rawOldPrice = oldPrice ? Number(oldPrice.replace(/\s+/g, "")) : null;

    const payload = {
      id: editingId,
      name: name.trim(),
      category: category.trim() || "krossovkalar",
      price: rawPrice,
      oldPrice: rawOldPrice,
      description: description.trim(),
      sizes: sizes.trim(),
      promoTag: promoTag.trim(),
      image: gallery[0],
      images: gallery,
      featured,
      isNew,
    };

    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/products", {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMsg(editingId ? "Kartochka yangilandi! ✅" : "Yangi kartochka qo'shildi! ✅");
      setTimeout(() => setMsg(""), 3000);
      resetForm();
      loadProducts();
    } else {
      const errData = await res.json();
      alert("XATOLIK:\n" + (errData.error || "Saqlashda muammo yuz berdi."));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Rostdan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      setMsg("Kartochka o'chirildi 🗑️");
      setTimeout(() => setMsg(""), 3000);
      loadProducts();
    }
  }

  // Быстрая кнопка для Yangi Kelganlar
  async function toggleNewQuick(p: any) {
    const nextState = !p.isNew;
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, isNew: nextState } as any : item
      )
    );

    const res = await fetch("/api/products", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ id: p.id, isNew: nextState }),
    });

    if (res.ok) {
      setMsg(nextState ? "🔥 'Yangi Kelganlar' ga qo'shildi!" : "'Yangi Kelganlar' dan olib tashlandi");
      setTimeout(() => setMsg(""), 2000);
    }
  }

  // Мгновенное переключение витрины на Главной
  async function toggleFeaturedQuick(p: Product) {
    const nextState = !p.featured;
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, featured: nextState } : item
      )
    );

    const res = await fetch("/api/products", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ id: p.id, featured: nextState }),
    });

    if (res.ok) {
      setMsg(nextState ? "⭐ Bosh sahifaga qo'shildi!" : "Bosh sahifadan olib tashlandi");
      setTimeout(() => setMsg(""), 2000);
    }
  }

  if (!authed) {
    return (
      <div 
        className="w-full min-h-[75vh] bg-cover bg-fixed bg-center py-10"
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(11,11,12,0.7), rgba(11,11,12,0.75)), url('/images/admin-bg.jpg')" }}
      >
        <section className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
        <div className="w-full border border-line bg-panel p-8 text-center shadow-2xl">
          <h1 className="font-display text-2xl font-bold uppercase text-white">
            ALAN SPORT — Admin Boshqaruvi
          </h1>
          <p className="mt-2 text-xs text-mute">Tizimga kirish uchun parolni kiriting</p>

          <form onSubmit={login} className="mt-6 space-y-4">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Parolni kiriting..."
                className="w-full border border-line bg-coal px-4 py-3 pr-11 text-center text-sm font-bold tracking-widest text-white outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center text-mute hover:text-white"
              >
                {showPass ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-brand py-3 font-display text-sm font-bold tracking-widest text-white uppercase transition hover:bg-flame"
            >
              Kirish
            </button>
          </form>
          <p className="mt-4 text-[11px] text-mute">Faqat do'kon egasi uchun</p>
        </div>
      </section>
      </div>
    );
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase().trim())
  );

  return (
    <div 
      className="w-full min-h-screen bg-cover bg-fixed bg-center py-6"
      style={{ backgroundImage: "linear-gradient(to bottom, rgba(11,11,12,0.7), rgba(11,11,12,0.75)), url('/images/admin-bg.jpg')" }}
    >
      <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 md:gap-4 md:pb-6">
        <div className="min-w-0 flex-1">
          <span className="bg-gold px-2 py-0.5 text-[10px] font-bold text-coal uppercase md:px-2.5 md:py-1 md:text-xs">
            Admin Boshqaruvi
          </span>
          <h1 className="mt-1.5 font-display text-lg font-bold uppercase leading-tight md:mt-2 md:text-3xl">
            Kartochkalar &amp; Tovar
          </h1>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Link
            href="/katalog"
            className="flex items-center gap-1 border border-line px-2.5 py-1.5 text-[10px] font-bold text-mute uppercase hover:border-white hover:text-white md:gap-2 md:px-4 md:py-2 md:text-xs"
          >
            Saytni ko'rish <IconArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="border border-brand/50 px-2.5 py-1.5 text-[10px] font-bold text-brand uppercase hover:bg-brand hover:text-white md:px-4 md:py-2 md:text-xs"
          >
            Chiqish
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-4 bg-brand px-4 py-3 font-display text-sm font-bold text-white uppercase animate-toast">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 md:mt-6 md:flex-wrap md:gap-2 md:pb-0">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`shrink-0 px-3 py-1.5 font-display text-[10px] font-bold tracking-wider uppercase transition md:px-4 md:py-2 md:text-xs md:tracking-widest ${
            activeTab === "products"
              ? "bg-brand text-white"
              : "border border-line text-mute hover:border-white hover:text-white"
          }`}
        >
          Mahsulotlar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("newArrivals")}
          className={`shrink-0 px-3 py-1.5 font-display text-[10px] font-bold tracking-wider uppercase transition md:px-4 md:py-2 md:text-xs md:tracking-widest ${
            activeTab === "newArrivals"
              ? "bg-brand text-white shadow-[0_0_15px_rgba(229,9,20,0.5)]"
              : "border border-brand/50 text-brand hover:bg-brand/10"
          }`}
        >
          🔥 Yangi Kelganlar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`shrink-0 px-3 py-1.5 font-display text-[10px] font-bold tracking-wider uppercase transition md:px-4 md:py-2 md:text-xs md:tracking-widest ${
            activeTab === "categories"
              ? "bg-gold text-coal"
              : "border border-line text-mute hover:border-gold hover:text-gold"
          }`}
        >
          🖼 Kategoriyalar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`shrink-0 px-3 py-1.5 font-display text-[10px] font-bold tracking-wider uppercase transition md:px-4 md:py-2 md:text-xs md:tracking-widest ${
            activeTab === "security"
              ? "bg-white text-coal"
              : "border border-line text-mute hover:border-white hover:text-white"
          }`}
        >
          🔒 Xavfsizlik
        </button>
      </div>

      {activeTab === "security" ? (
        <div className="mt-5 border border-line bg-panel p-3.5 md:mt-8 md:p-6">
          <h2 className="font-display text-lg font-bold uppercase text-white">🔒 Parolni o'zgartirish</h2>
          <p className="mt-1 text-sm text-mute">
            {hasCustomPass ? "✅ Brauzerda yangi parol o'rnatilgan (local). Serverda ham saqlanadi (fayl)." : "Hozir env paroli ishlatilmoqda: AlanSport_Bukhara_2026. Bu yerda o'zgartirsangiz — hech qanday server/BD kerak emas, parol brauzerda + faylda saqlanadi."}
          </p>
          <p className="mt-1 text-[11px] text-mute/70">Eslatma: Netlify da fayl vaqtinchalik (restart dan keyin env ga qaytadi), lekin brauzer local paroli qoladi — shu brauzerda yangi parol bilan kirasiz.</p>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3 max-w-md">
            <label className="block">
              <span className="text-xs font-bold text-mute uppercase">Eski parol *</span>
              <div className="relative mt-1">
                <input type={showOld ? "text" : "password"} value={oldPassInput} onChange={(e)=>setOldPassInput(e.target.value)} placeholder="Eski parolni kiriting" className="w-full border border-line bg-coal px-3 py-2 pr-10 text-sm text-white outline-none focus:border-brand" />
                <button type="button" onClick={()=>setShowOld(v=>!v)} aria-label={showOld ? "Yashirish" : "Ko'rsatish"} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center text-mute hover:text-white">
                  {showOld ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-mute uppercase">Yangi parol * (kamida 6 ta belgi)</span>
              <div className="relative mt-1">
                <input type={showNew ? "text" : "password"} value={newPassInput} onChange={(e)=>setNewPassInput(e.target.value)} placeholder="Yangi parol" className="w-full border border-line bg-coal px-3 py-2 pr-10 text-sm text-white outline-none focus:border-brand" />
                <button type="button" onClick={()=>setShowNew(v=>!v)} aria-label={showNew ? "Yashirish" : "Ko'rsatish"} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center text-mute hover:text-white">
                  {showNew ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-mute uppercase">Tasdiqlash *</span>
              <div className="relative mt-1">
                <input type={showConfirm ? "text" : "password"} value={confirmPassInput} onChange={(e)=>setConfirmPassInput(e.target.value)} placeholder="Yangi parolni qayta kiriting" className="w-full border border-line bg-coal px-3 py-2 pr-10 text-sm text-white outline-none focus:border-brand" />
                <button type="button" onClick={()=>setShowConfirm(v=>!v)} aria-label={showConfirm ? "Yashirish" : "Ko'rsatish"} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center text-mute hover:text-white">
                  {showConfirm ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            {passChangeMsg && <div className="bg-panel2 border border-line px-3 py-2 text-sm font-bold text-white">{passChangeMsg}</div>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-brand py-2.5 font-display text-sm font-bold tracking-widest text-white uppercase hover:bg-flame">Saqlash</button>
              {hasCustomPass && <button type="button" onClick={handleResetPass} className="px-4 py-2.5 border border-line text-xs font-bold text-mute uppercase hover:border-brand hover:text-brand">Tiklash</button>}
            </div>
          </form>
          <div className="mt-4 border-t border-line pt-3 text-[11px] text-mute">
            <p>• O'zgartirish oniy — qayta login talab qilinmaydi, keyingi kirishda yangi parol ishlaydi.</p>
            <p>• Hech qanday tashqi server/BD yo'q — faqat data/admin.json + localStorage.</p>
          </div>
        </div>
      ) : activeTab === "newArrivals" ? (
        <div className="mt-5 border border-brand/50 bg-panel p-3.5 shadow-[0_0_30px_rgba(229,9,20,0.15)] md:mt-8 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div className="min-w-0 flex-1">
              <span className="inline-block bg-brand px-2 py-0.5 font-display text-[9px] font-bold tracking-wider text-white uppercase md:px-2.5 md:py-1 md:text-[10px] md:tracking-widest">
                NEW 2026
              </span>
              <h2 className="mt-1.5 font-display text-base font-bold uppercase leading-tight text-brand md:mt-2 md:text-lg">
                🔥 "Yangi Kelganlar"
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-mute md:text-sm md:leading-normal">
                Matn, o'lcham, foto va narxni shu yerda o'zgartiring.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-xl font-bold text-brand md:text-2xl">
                {products.filter((p: any) => p.isNew).length}
              </p>
              <p className="text-[9px] font-bold tracking-wider text-mute uppercase md:text-[10px] md:tracking-widest">
                Tanlangan
              </p>
            </div>
          </div>

          {/* ===== ФОРМА РЕДАКТИРОВАНИЯ / ДОБАВЛЕНИЯ ВНУТРИ ВКЛАДКИ ===== */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const gallery = images.length > 0 ? images : image ? [image] : [];
              if (!name.trim() || !price || gallery.length === 0) {
                alert("Iltimos, nom, narx va kamida 1 ta rasm kiriting!");
                return;
              }
              const rawPrice = Number(price.replace(/\s+/g, ""));
              const rawOldPrice = oldPrice ? Number(oldPrice.replace(/\s+/g, "")) : null;
              const payload = {
                id: editingId,
                name: name.trim(),
                category: category.trim() || "krossovkalar",
                price: rawPrice,
                oldPrice: rawOldPrice,
                description: description.trim(),
                sizes: sizes.trim(),
                promoTag: promoTag.trim(),
                image: gallery[0],
                images: gallery,
                featured,
                isNew: true,
              };
              const method = editingId ? "PUT" : "POST";
              const res = await fetch("/api/products", {
                method,
                headers: authHeaders(),
                body: JSON.stringify(payload),
              });
              if (res.ok) {
                setMsg(editingId ? "✅ Kartochka yangilandi!" : "🔥 Yangi kartochka qo'shildi!");
                setTimeout(() => setMsg(""), 3000);
                resetForm();
                setIsNew(false);
                loadProducts();
              } else {
                const errData = await res.json();
                alert("XATOLIK:\n" + (errData.error || "Saqlashda muammo yuz berdi."));
              }
            }}
            className={`mb-6 border p-3.5 transition md:mb-8 md:p-5 ${
              editingId ? "border-gold bg-coal shadow-[0_0_20px_rgba(212,175,55,0.15)]" : "border-line bg-coal"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-display text-base font-bold uppercase text-gold">
                {editingId ? "✏️ Kartochkani tahrirlash" : "➕ Yangi kartochka qo'shish (NEW)"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsNew(false); }}
                  className="text-xs font-bold text-brand uppercase hover:text-flame"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Левая колонка — текст */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-mute uppercase">Mahsulot nomi *</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Nike Air Max 270"
                    className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm text-white outline-none focus:border-brand"
                  />
                </label>

                <div className="block">
                  <span className="text-xs font-bold text-mute uppercase">Kategoriya *</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCategory(c.key)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase transition ${
                          category === c.key
                            ? "bg-gold text-coal"
                            : "border border-line text-mute hover:border-gold hover:text-white"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Умные размеры */}
                <div className="block border border-line bg-panel p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold uppercase">📏 O'lchamlar</span>
                    <button type="button" onClick={() => setSizes("")} className="text-[10px] font-bold text-brand uppercase hover:text-flame">
                      Tozalash
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(category === "krossovkalar" ? ["36","37","38","39","40","41","42","43","44","45"] :
                      category === "kiyimlar" ? ["XS","S","M","L","XL","XXL","3XL"] :
                      ["Standart", "5 kg", "10 kg", "15 kg", "12 oz", "14 oz"]
                    ).map((s) => {
                      const currentSizes = sizes.split(",").map((x) => x.trim()).filter(Boolean);
                      const isActive = currentSizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (isActive) setSizes(currentSizes.filter((x) => x !== s).join(","));
                            else setSizes([...currentSizes, s].join(","));
                          }}
                          className={`px-2.5 py-1 text-xs font-bold transition ${
                            isActive
                              ? "bg-brand text-white shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                              : "border border-line text-mute hover:border-brand hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    placeholder="Yoki qo'lda yozing..."
                    className="mt-3 w-full border border-line bg-coal px-3 py-1.5 text-xs text-white outline-none focus:border-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block min-w-0">
                    <span className="text-xs font-bold text-mute uppercase">Narxi (so'm) *</span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(formatNumberInput(e.target.value))}
                      placeholder="480 000"
                      className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm font-bold text-white outline-none focus:border-brand"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="text-xs font-bold text-mute uppercase">Eski narxi</span>
                    <input
                      type="text"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(formatNumberInput(e.target.value))}
                      placeholder="560 000"
                      className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm font-bold text-white outline-none focus:border-brand"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-bold text-brand uppercase">🔥 Aksiya yozuvi</span>
                  <input
                    value={promoTag}
                    onChange={(e) => setPromoTag(e.target.value)}
                    placeholder="Masalan: 🎁 + Paypoq sovg'a"
                    className="mt-1 w-full border border-brand/50 bg-brand/10 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-gold uppercase">📝 Tavsif (matn)</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Mahsulot haqida batafsil matn..."
                    className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm leading-relaxed text-white outline-none focus:border-brand"
                  />
                </label>
              </div>

              {/* Правая колонка — фото + редактор */}
              <div className="space-y-4">
                <div className="block">
                  <span className="text-xs font-bold text-gold uppercase">🖼 Mahsulot fotolari *</span>
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-line bg-panel p-5 text-center transition hover:border-gold">
                    <span className="text-xs font-bold text-gold uppercase">
                      {uploading ? "Yuklanmoqda..." : "📁 Rasm tanlash (1 yoki bir nechta)"}
                    </span>
                    <span className="text-[10px] text-mute">Kompyuter yoki telefondan</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {images.map((src, index) => (
                        <div key={`${index}-${src.slice(0, 24)}`} className="relative border border-line bg-panel p-1">
                          <img src={src} alt={`Preview ${index}`} className="h-20 w-full object-cover" />
                          {index === 0 && (
                            <span className="absolute left-1 top-1 bg-gold px-1.5 py-0.5 text-[8px] font-black text-coal uppercase">
                              ASOSIY
                            </span>
                          )}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => openEditorForImage(src, index)}
                              className="flex-1 px-2 py-2 text-[10px] font-bold bg-brand text-white uppercase hover:bg-flame shadow-[0_0_10px_rgba(229,9,20,0.5)]"
                            >
                              ✂️ Foto tahrirlash (HD)
                            </button>
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => setMainImage(index)}
                                className="px-1 py-1.5 text-[9px] font-bold border border-gold text-gold uppercase hover:bg-gold hover:text-coal"
                              >
                                Asosiy
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImageAt(index)}
                              className="px-1.5 py-1.5 text-[9px] font-bold border border-line text-mute uppercase hover:border-brand hover:text-brand"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    defaultValue=""
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const url = (e.target as HTMLInputElement).value.trim();
                        if (url) {
                          setImages((prev) => {
                            const next = [...prev, url];
                            if (!image) setImage(url);
                            return next;
                          });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                    placeholder="Yoki rasm URL + Enter..."
                    className="mt-2 w-full border border-line bg-panel px-3 py-1.5 text-xs text-mute outline-none focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand py-3.5 font-display text-sm font-bold tracking-widest text-white uppercase transition hover:bg-flame shadow-[0_0_20px_rgba(229,9,20,0.35)]"
                >
                  {editingId ? "💾 Saqlash (Yangi Kelganlar)" : "🔥 Qo'shish + Yangi Kelganlarga"}
                </button>
              </div>
            </div>
          </form>

          {/* ===== СПИСОК ТОВАРОВ ВНУТРИ YANGI KELGANLAR ===== */}
          <div className="mb-8">
            <h3 className="font-display text-sm font-bold uppercase text-gold mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              "Yangi Kelganlar" ichida — tahrirlash uchun bosing
            </h3>
            {products.filter((p: any) => p.isNew).length === 0 ? (
              <div className="border border-dashed border-line bg-coal p-8 text-center">
                <p className="text-sm text-mute">Hozircha bo'sh. Yuqoridagi formadan yangi kartochka qo'shing 👆</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {products.filter((p: any) => p.isNew).map((p) => (
                  <div
                    key={`in-${p.id}`}
                    className={`relative border bg-coal p-3 transition ${
                      editingId === p.id ? "border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "border-brand/40 hover:border-brand"
                    }`}
                  >
                    <div className="flex gap-3">
                      <img src={p.image} alt={p.name} className="h-20 w-20 shrink-0 object-cover border border-line" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-bold text-white uppercase">{p.name}</p>
                        <p className="text-xs font-bold text-gold mt-0.5">{formatPrice(p.price)} so'm</p>
                        <p className="text-[10px] text-mute mt-1 truncate">{p.sizes || "O'lcham yo'q"}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(p as any)}
                            className="flex-1 px-3 py-2 text-[11px] font-bold bg-brand text-white uppercase hover:bg-flame shadow-[0_0_12px_rgba(229,9,20,0.45)]"
                          >
                            ✏️ Tahrirlash
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Быстро открыть фоторедактор главного фото
                              const src = p.image;
                              if (!src) {
                                alert("Rasm yo'q!");
                                return;
                              }
                              startEdit(p as any);
                              setTimeout(() => openEditorForImage(src, 0), 100);
                            }}
                            className="px-3 py-2 text-[11px] font-bold border border-gold text-gold uppercase hover:bg-gold hover:text-coal"
                          >
                            ✂️ Foto
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNewQuick(p)}
                            className="px-3 py-2 text-[11px] font-bold border border-line text-mute uppercase hover:border-brand hover:text-brand"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== ДОБАВИТЬ ИЗ СУЩЕСТВУЮЩИХ ===== */}
          <div className="border-t border-line pt-6">
            <h3 className="font-display text-sm font-bold uppercase text-mute mb-3">
              Boshqa mahsulotlardan qo'shish (faqat ro'yxatga)
            </h3>
            <div className="relative mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Qidirish..."
                className="w-full border border-line bg-coal py-2 pr-8 pl-3 text-sm text-white outline-none focus:border-brand"
              />
              <IconSearch className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            </div>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-h-[400px] overflow-y-auto pr-2">
              {products
                .filter((p: any) => !p.isNew)
                .filter((p) => p.name.toLowerCase().includes(q.toLowerCase().trim()))
                .map((p) => (
                  <button
                    key={`out-${p.id}`}
                    type="button"
                    onClick={() => toggleNewQuick(p)}
                    className="border border-line bg-coal p-2 text-left hover:border-brand hover:shadow-[0_0_15px_rgba(229,9,20,0.3)] transition group"
                  >
                    <div className="relative">
                      <img src={p.image} alt={p.name} className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition" />
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-brand/80 transition">
                        <span className="text-white font-bold text-2xl">+</span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-gold">{formatPrice(p.price)} so'm</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      ) : activeTab === "categories" ? (
        <div className="mt-5 border border-line bg-panel p-3.5 md:mt-8 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold uppercase text-gold">
                Kategoriya muharriri
              </h2>
              <p className="mt-1 text-sm text-mute">
                Bosh sahifadagi 4 ta kartochka: rasm, nom va tavsifni o'zgartirish.
              </p>
            </div>
            <button
              type="button"
              onClick={saveCategories}
              className="bg-brand px-5 py-2.5 font-display text-xs font-bold tracking-widest text-white uppercase transition hover:bg-flame"
            >
              Saqlash
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {categories.map((cat) => (
              <div key={cat.key} className="border border-line bg-coal p-4">
                <div className="relative aspect-[16/10] overflow-hidden border border-line bg-panel2">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.label || "Kategoriya"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-mute">
                      Rasm tanlanmagan
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="font-display text-sm font-bold uppercase text-white">
                      {cat.label || "NOMSIZ"}
                    </p>
                    <p className="text-[11px] text-white/80">
                      {cat.desc || "Tavsif yo'q"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="text-[10px] font-bold tracking-widest text-mute uppercase">
                      Kategoriya nomi
                    </span>
                    <input
                      value={cat.label || ""}
                      onChange={(e) =>
                        updateCategoryField(cat.key, "label", e.target.value)
                      }
                      placeholder="Masalan: Krossovkalar"
                      className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm text-white outline-none focus:border-gold"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold tracking-widest text-mute uppercase">
                      Qisqa tavsif
                    </span>
                    <input
                      value={cat.desc || ""}
                      onChange={(e) =>
                        updateCategoryField(cat.key, "desc", e.target.value)
                      }
                      placeholder="Masalan: Oyoq kiyimlar • 39–45"
                      className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm text-white outline-none focus:border-gold"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold tracking-widest text-brand uppercase">
                      🔥 Aksiya yozuvi (ixtiyoriy)
                    </span>
                    <input
                      value={cat.promoTag || ""}
                      onChange={(e) =>
                        updateCategoryField(cat.key, "promoTag", e.target.value)
                      }
                      placeholder="Masalan: Barchasiga -30%!"
                      className="mt-1 w-full border border-brand/50 bg-brand/10 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold tracking-widest text-mute uppercase">
                      Rasm URL (ixtiyoriy)
                    </span>
                    <input
                      value={typeof cat.image === "string" && !cat.image.startsWith("data:") ? cat.image : ""}
                      onChange={(e) =>
                        updateCategoryField(cat.key, "image", e.target.value)
                      }
                      placeholder="https://... yoki bo'sh qoldiring"
                      className="mt-1 w-full border border-line bg-panel px-3 py-2 text-xs text-mute outline-none focus:border-gold"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-center border border-dashed border-line bg-panel px-3 py-2 text-center transition hover:border-gold">
                    <span className="text-[11px] font-bold tracking-wider text-gold uppercase">
                      {catUploadingKey === cat.key
                        ? "Yuklanmoqda..."
                        : "📁 Qurilmadan yangi rasm tanlash"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={catUploadingKey === cat.key}
                      onChange={(e) => handleCategoryImageChange(e, cat.key)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div className="mt-5 grid gap-4 md:mt-8 md:gap-8 lg:grid-cols-12">
        {/* FORM */}
        <div className="lg:col-span-5 min-w-0">
          <form
            onSubmit={handleSubmit}
            className={`border bg-panel p-3.5 transition md:p-6 ${
              editingId ? "border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]" : "border-line"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold uppercase text-gold truncate">
                {editingId ? "Kartochkani Tahrirlash" : "Yangi Kartochka Qo'shish"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="shrink-0 text-xs font-bold text-brand uppercase hover:text-flame"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-mute uppercase">Mahsulot Nomi *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Nike Air Max 270"
                  className="mt-1 w-full border border-line bg-coal px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
              </label>

              {/* Kategoriya */}
              <div className="block">
                <span className="text-xs font-bold text-mute uppercase">Kategoriya *</span>
                <input
                  list="category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Yangi kategoriya nomini yozing..."
                  className="mt-1 w-full border border-line bg-coal px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
                <datalist id="category-suggestions">
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </datalist>

                <div className="mt-2 flex flex-wrap gap-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key)}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase transition ${
                        category === c.key
                          ? "bg-gold text-coal"
                          : "border border-line text-mute hover:border-gold hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="block border border-line bg-coal p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gold uppercase">📏 O'lchamlar (Razmerlar)</span>
                  <button type="button" onClick={() => setSizes("")} className="text-[10px] font-bold text-brand uppercase hover:text-flame">
                    Barchasini tozalash
                  </button>
                </div>
                
                {/* Умные кнопки размеров в зависимости от категории */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(category === "krossovkalar" ? ["36","37","38","39","40","41","42","43","44","45"] :
                    category === "kiyimlar" ? ["XS","S","M","L","XL","XXL","3XL"] :
                    ["Standart", "5 kg", "10 kg", "15 kg", "12 oz", "14 oz"]
                  ).map((s) => {
                    const currentSizes = sizes.split(",").map(x => x.trim()).filter(Boolean);
                    const isActive = currentSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setSizes(currentSizes.filter(x => x !== s).join(","));
                          } else {
                            setSizes([...currentSizes, s].join(","));
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold transition ${
                          isActive 
                            ? "bg-brand text-white shadow-[0_0_10px_rgba(229,9,20,0.5)]" 
                            : "border border-line bg-panel text-mute hover:border-brand hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                <input
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="Yoki qo'lda yozing (vergul bilan ajrating)..."
                  className="mt-4 w-full border border-line bg-panel px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
                <p className="mt-1.5 text-[10px] text-mute">
                  Tugmalarni bosing yoki o'zingiz yozing. Uskunalar va aksessuarlar uchun bo'sh qoldirishingiz mumkin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block min-w-0">
                  <span className="text-xs font-bold text-mute uppercase truncate block">Narxi (so'm) *</span>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(formatNumberInput(e.target.value))}
                    placeholder="480 000"
                    className="mt-1 w-full border border-line bg-coal px-3 py-2 text-sm font-bold text-white outline-none focus:border-brand"
                  />
                </label>

                <label className="block min-w-0">
                  <span className="text-xs font-bold text-mute uppercase truncate block">Eski Narxi</span>
                  <input
                    type="text"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(formatNumberInput(e.target.value))}
                    placeholder="560 000"
                    className="mt-1 w-full border border-line bg-coal px-3 py-2 text-sm font-bold text-white outline-none focus:border-brand"
                  />
                </label>
              </div>

              {/* Множественные фото товара */}
              <div className="block">
                <span className="text-xs font-bold text-gold uppercase">Mahsulot Fotolari (Bir nechta rasm) *</span>
                <div className="mt-1 space-y-2">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-line bg-coal p-4 text-center transition hover:border-gold">
                    <span className="text-xs font-bold text-gold uppercase">
                      {uploading ? "Rasmlar yuklanmoqda..." : "📁 Bitta yoki bir nechta rasm tanlash"}
                    </span>
                    <span className="text-[10px] text-mute">Kompyuter yoki telefondan rasmlarni tanlang</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((src, index) => (
                        <div key={`${index}-${src.slice(0, 20)}`} className="relative border border-line bg-coal p-1">
                          <img src={src} alt={`Preview ${index}`} className="h-16 w-full object-cover" />
                          {index === 0 && (
                            <span className="absolute left-1 top-1 bg-gold px-1.5 py-0.5 text-[8px] font-black text-coal uppercase">
                              ASOSIY
                            </span>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => openEditorForImage(src, index)}
                              className="flex-1 px-1.5 py-1.5 text-[9px] font-bold bg-brand text-white uppercase hover:bg-flame shadow-[0_0_8px_rgba(229,9,20,0.5)]"
                            >
                              ✂️ Tahrirlash
                            </button>
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => setMainImage(index)}
                                className="px-1.5 py-1.5 text-[9px] font-bold bg-coal border border-gold text-gold uppercase hover:bg-gold hover:text-coal"
                              >
                                Asosiy
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImageAt(index)}
                              className="px-1.5 py-1.5 text-[9px] font-bold bg-coal border border-line text-mute uppercase hover:border-brand hover:text-brand"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    value=""
                    onChange={(e) => {
                      const url = e.target.value.trim();
                      if (url) {
                        setImages((prev) => [...prev, url]);
                        e.target.value = "";
                      }
                    }}
                    placeholder="Yoki rasm URL kiriting va Enter bosing..."
                    className="w-full border border-line bg-coal px-3 py-1.5 text-xs text-mute outline-none focus:border-brand"
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-brand uppercase">🔥 Aksiya / Yorliq (ixtiyoriy)</span>
                <input
                  value={promoTag}
                  onChange={(e) => setPromoTag(e.target.value)}
                  placeholder="Masalan: 🎁 + Paypoq sovg'a yoki 🔥 -30%"
                  className="mt-1 w-full border border-brand/50 bg-brand/10 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-gold uppercase">📝 Mahsulot Tavsifi (Matn)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Mahsulot haqida batafsil ma'lumot, uning qulayliklari, materiali va o'ziga xosliklarini yozing..."
                  className="mt-2 w-full border border-line bg-coal px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-brand"
                />
                <p className="mt-1 text-[10px] text-mute">
                  Ushbu matn mahsulot sahifasida katta bo'lib chiqadi. Xaridorga qiziq bo'lgan barcha ma'lumotlarni yozing.
                </p>
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-xs font-bold text-white uppercase">
                  ⭐ "Ommabop" bo'limida ko'rsatish
                </span>
              </label>

              <p className="text-[10px] text-mute italic border-l-2 border-brand/50 pl-2">
                💡 "Yangi Kelganlar" bo'limiga qo'shish uchun tepadagi "🔥 Yangi Kelganlar" tabiga o'ting
              </p>

              <button
                type="submit"
                className="mt-4 w-full bg-brand py-3 font-display text-sm font-bold tracking-widest text-white uppercase transition hover:bg-flame"
              >
                {editingId ? "Kartochkani Saqlash" : "Kartochka Qo'shish"}
              </button>
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-7 min-w-0">
          <div className="flex items-center justify-between gap-4 border border-line bg-panel p-4">
            <div className="relative flex-1 min-w-0">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Qidirish..."
                className="w-full border border-line bg-coal py-2 pr-8 pl-3 text-sm text-white outline-none focus:border-brand"
              />
              <IconSearch className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            </div>
            <button
              onClick={loadProducts}
              className="flex shrink-0 items-center gap-1 border border-line bg-coal px-3 py-2 text-xs font-bold text-mute hover:text-white"
            >
              <IconRefresh className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-line border border-line bg-panel">
            {loading ? (
              <p className="p-6 text-center text-sm text-mute">Yuklanmoqda...</p>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-mute">Kartochka topilmadi</p>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="p-3 transition hover:bg-coal/50 md:p-4">
                  <div className="flex items-start gap-2.5 md:gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-14 w-14 shrink-0 object-cover border border-line" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-line bg-coal text-[10px] text-mute">
                        Rasm yo'q
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs font-bold text-white uppercase leading-tight md:text-sm line-clamp-2">
                        {p.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.featured && (
                          <span className="bg-gold/10 px-1 py-0.5 text-[8px] font-black tracking-wider text-gold md:text-[9px]">
                            ⭐ OMMABOP
                          </span>
                        )}
                        {(p as any).isNew && (
                          <span className="bg-brand/20 px-1 py-0.5 text-[8px] font-black tracking-wider text-brand md:text-[9px]">
                            🔥 NEW
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] font-bold text-gold md:text-xs">
                        {formatPrice(p.price)} so'm
                        {p.oldPrice && (
                          <span className="ml-2 text-mute line-through">{formatPrice(p.oldPrice)}</span>
                        )}
                      </p>
                      <span className="text-[9px] text-mute uppercase md:text-[10px]">{p.category}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 md:mt-3 md:flex md:flex-wrap md:justify-end">
                    <button
                      type="button"
                      onClick={() => toggleFeaturedQuick(p)}
                      className={`border px-1.5 py-1 text-[9px] font-bold uppercase transition md:px-2 md:text-xs ${
                        p.featured
                          ? "border-gold bg-gold/10 text-gold hover:bg-gold/20"
                          : "border-line bg-coal text-mute hover:border-gold hover:text-gold"
                      }`}
                    >
                      {p.featured ? "⭐ Olib tashlash" : "☆ Ommabop"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="border border-line bg-coal px-1.5 py-1 text-[9px] font-bold text-white uppercase hover:border-white md:px-2 md:text-xs"
                    >
                      Tahrirlash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="border border-line bg-coal px-1.5 py-1 text-[9px] font-bold text-brand uppercase hover:border-brand md:px-2 md:text-xs"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {editorOpen && editorSrc && (
        <ImageEditor
          key={`${editorSrc.slice(0, 40)}-${(window as any).__editImageIndex}`}
          src={editorSrc}
          initialSettings={editorSettings ?? undefined}
          onApply={(dataUrl, settings) => {
            const editIndex = (window as any).__editImageIndex;
            const original = editorSrc; // чистый оригинал, с которым работали

            setImages((prev) => {
              let next: string[];
              let targetIndex = 0;

              if (typeof editIndex === "number" && editIndex >= 0 && editIndex < prev.length) {
                next = [...prev];
                next[editIndex] = dataUrl;
                targetIndex = editIndex;
              } else if (prev.length === 0) {
                next = [dataUrl];
                targetIndex = 0;
              } else {
                next = [...prev, dataUrl];
                targetIndex = next.length - 1;
              }

              // Запоминаем оригинал + слайдеры — при следующем открытии всё восстановится
              setImageMeta((m) => ({
                ...m,
                [targetIndex]: { original, settings },
              }));

              setImage(next[0] || dataUrl);
              return next;
            });

            setEditorOpen(false);
            setEditorSrc("");
            setEditorSettings(null);
            (window as any).__editImageIndex = -1;
            setMsg("🖼 Effekt saqlandi! Qayta ochsangiz sozlamalar joyida qoladi. SAQLASH ni bosing.");
            setTimeout(() => setMsg(""), 3000);
          }}
          onCancel={() => {
            // Просто закрыть — галерею и мету НЕ трогаем
            setEditorOpen(false);
            setEditorSrc("");
            setEditorSettings(null);
            (window as any).__editImageIndex = -1;
          }}
        />
      )}
    </section>
    </div>
  );
}