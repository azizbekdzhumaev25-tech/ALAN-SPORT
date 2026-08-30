"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { useToast } from "@/components/Toast";
import {
  IconClock,
  IconInstagram,
  IconMapPin,
  IconPhone,
  IconSend,
  IconTelegram,
} from "@/components/Icons";

export default function ContactsPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast("Avval xabar matnini yozing");
      return;
    }
    // Очистка от скриптов
    const safeName = name.replace(/<[^>]*>?/gm, "").trim() || "Mijoz";
    const safeMessage = message.replace(/<[^>]*>?/gm, "").trim();

    const full = `Assalomu alaykum! Mening ismim: ${safeName}. ${safeMessage}`;
    setSending(true);
    const done = () => {
      setSending(false);
      setName("");
      setMessage("");
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(full)
        .then(() => toast("Xabar nusxalandi — Telegram chatga yuboring!"))
        .catch(() => toast("Telegram ochilmoqda…"))
        .finally(done);
    } else {
      toast("Telegram ochilmoqda…");
      done();
    }
    window.open(SITE.telegram, "_blank", "noopener");
  }

  return (
    <>
      {/* head */}
      <section 
        className="relative w-full border-b border-line bg-cover bg-center bg-no-repeat py-7 md:py-14"
        style={{ backgroundImage: "linear-gradient(to right, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.75) 50%, rgba(11,11,12,0.88) 100%), url('/images/contacts-header-bg.jpg')" }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <p className="text-[10px] md:text-xs font-semibold tracking-widest text-mute uppercase">
            <Link href="/" className="transition hover:text-gold">Bosh sahifa</Link>
            <span className="mx-2 text-brand">/</span>
            <span className="text-gold">Bog'lanish</span>
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold uppercase md:mt-3 md:text-5xl">
            Bog'lanish
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-semibold leading-snug text-mute md:mt-3 md:text-base md:leading-relaxed">
            Savollaringiz bo'lsa — qo'ng'iroq qiling, yozing yoki do'konimizga tashrif
            buyuring. Biz har kuni 09:00 dan 23:00 gacha ishlaymiz.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        {/* info cards */}
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {/* TELEFON */}
          <div className="flex gap-3 bg-coal p-3.5 sm:block sm:p-5 md:p-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-white md:h-11 md:w-11">
              <IconPhone className="h-4 w-4 md:h-5 md:w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-semibold uppercase md:mt-4 md:text-lg">
                Telefon
              </h2>
              <div className="mt-1.5 space-y-1 md:mt-3 md:space-y-2">
                <a
                  href={SITE.phoneHref}
                  className="block font-display text-base font-bold text-white transition hover:text-gold md:text-xl"
                >
                  {SITE.phone}
                </a>
                <a
                  href={SITE.phone2Href}
                  className="block font-display text-base font-bold text-white transition hover:text-gold md:text-xl"
                >
                  {SITE.phone2}
                </a>
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-mute md:mt-3 md:text-xs">
                Qo'ng'iroqlar har kuni 09:00–23:00 da qabul qilinadi.
              </p>
            </div>
          </div>

          {/* MANZIL */}
          <div className="flex gap-3 bg-coal p-3.5 sm:block sm:p-5 md:p-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-gold text-coal md:h-11 md:w-11">
              <IconMapPin className="h-4 w-4 md:h-5 md:w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-semibold uppercase md:mt-4 md:text-lg">
                Manzil
              </h2>
              <p className="mt-1.5 text-xs leading-snug font-semibold text-white md:mt-3 md:text-sm md:leading-relaxed">
                {SITE.address}
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-mute md:mt-3 md:text-xs">
                Mo'ljal: shahar markazi, yorqin neon peshtoqli do'kon.
              </p>
            </div>
          </div>

          {/* ISH VAQTI */}
          <div className="flex gap-3 bg-coal p-3.5 sm:block sm:p-5 md:p-8">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-brand text-white md:h-11 md:w-11">
              <IconClock className="h-4 w-4 md:h-5 md:w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-semibold uppercase md:mt-4 md:text-lg">
                Ish vaqti
              </h2>
              <p className="mt-1.5 font-display text-base font-bold text-white md:mt-3 md:text-xl">
                {SITE.hours}
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-mute md:mt-3 md:text-xs">
                Dam olish kunlarisiz, bayramlarda ham ochiq.
              </p>
            </div>
          </div>
        </div>

        {/* social actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={SITE.telegram}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 bg-brand px-5 py-3.5 font-display text-sm font-semibold tracking-widest uppercase transition hover:bg-flame"
          >
            <IconTelegram className="h-5 w-5" />
            Telegram
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2 border border-line bg-panel px-5 py-3.5 font-display text-sm font-semibold tracking-widest uppercase transition hover:border-gold hover:text-gold"
          >
            <IconInstagram className="h-5 w-5" />
            Instagram
          </a>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* map */}
          <div className="clip-angle border border-line bg-panel p-2">
            <div className="relative h-80 w-full overflow-hidden bg-panel2 lg:h-full lg:min-h-96">
              <iframe
                title="ALAN SPORT — Buxoro xaritasi"
                src={SITE.mapEmbed}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-mute">
                <IconMapPin className="h-4 w-4 text-brand" />
                {SITE.address}
              </p>
              <span className="shrink-0 text-[10px] font-bold tracking-widest text-gold uppercase">
                Yandex Maps
              </span>
            </div>
          </div>

          {/* form */}
          <form onSubmit={submit} className="clip-angle flex flex-col border border-line bg-panel p-6 md:p-8">
            <p className="font-display text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              Tez aloqa
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold uppercase">
              Telegramga xabar yozing
            </h2>
            <p className="mt-2 text-sm text-mute">
              Xabaringizni qoldiring — biz siz bilan Telegram orqali bog'lanamiz.
            </p>

            <label className="mt-6 block">
              <span className="text-xs font-bold tracking-widest text-mute uppercase">Ismingiz</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Aziz"
                className="mt-1.5 w-full border border-line bg-coal px-4 py-2.5 text-sm text-white placeholder-mute/60 outline-none focus:border-brand"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold tracking-widest text-mute uppercase">Xabaringiz</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Masalan: Nike Air Max krossovkasining 42 o'lchami bormi?"
                className="mt-1.5 w-full resize-none border border-line bg-coal px-4 py-2.5 text-sm text-white placeholder-mute/60 outline-none focus:border-brand"
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="mt-6 flex items-center justify-center gap-2 bg-brand px-6 py-3 font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:bg-flame disabled:opacity-60"
            >
              <IconSend className="h-4 w-4" />
              {sending ? "Ochilmoqda…" : "Yuborish"}
            </button>
            <p className="mt-3 text-[11px] text-mute">
              Tugma bosilganda xabar nusxalanadi va Telegram chati ochiladi — matnni
              yuborish tugmasini bosing.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
