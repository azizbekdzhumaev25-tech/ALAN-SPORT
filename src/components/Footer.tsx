import Link from "next/link";
import { CATEGORIES, NAV, SITE } from "@/lib/site";
import {
  IconClock,
  IconInstagram,
  IconMapPin,
  IconPhone,
  IconTelegram,
} from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t-2 border-brand/60 bg-coal">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-block" aria-label="ALAN SPORT">
            <span className="font-display text-2xl font-black italic tracking-wider text-white">
              ALAN <span className="text-brand">SPORT</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-mute">
            Buxorodagi eng keng assortimentli sport do'koni. Sifatli va hamyonbop
            sport tovarlari — krossovkalar, kiyimlar, anjomlar va aksessuarlar.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center border border-line text-mute transition hover:border-gold hover:text-gold"
            >
              <IconInstagram className="h-4 w-4" />
            </a>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener"
              aria-label="Telegram"
              className="flex h-9 w-9 items-center justify-center border border-line text-mute transition hover:border-brand hover:text-brand"
            >
              <IconTelegram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Sahifalar
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-mute transition hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Kategoriyalar
          </h3>
          <ul className="mt-4 space-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link
                  href={`/katalog?cat=${c.key}`}
                  className="text-sm text-mute transition hover:text-white"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Bog'lanish
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-mute">
            <li>
              <a href={SITE.phoneHref} className="flex items-center gap-2 transition hover:text-white">
                <IconPhone className="h-4 w-4 text-brand" />
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {SITE.address}
            </li>
            <li className="flex items-center gap-2">
              <IconClock className="h-4 w-4 text-gold" />
              {SITE.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-mute sm:flex-row">
          <p>© 2026 ALAN SPORT. Barcha huquqlar himoyalangan.</p>
          <p className="tracking-widest text-gold/80 uppercase">Buxoro • O'zbekiston</p>
        </div>
      </div>
    </footer>
  );
}
