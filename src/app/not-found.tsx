import Link from "next/link";
import type { Metadata } from "next";
import { IconArrowRight, IconBall } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Sahifa topilmadi",
};

export default function NotFound() {
  return (
    <section className="stripes-dark mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center md:py-32">
      <span className="flex h-16 w-16 items-center justify-center border border-line text-brand">
        <IconBall className="h-8 w-8" />
      </span>
      <p className="glow-gold mt-6 font-display text-7xl font-bold text-gold md:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase md:text-4xl">
        Sahifa topilmadi
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
        Siz izlagan sahifa mavjud emas yoki ko'chirilgan. Sport tovarlari katalogimizni
        ko'rib chiqing — keraklisi albatta topiladi.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 bg-brand px-6 py-3 font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:bg-flame"
        >
          Bosh sahifa
        </Link>
        <Link
          href="/katalog"
          className="flex items-center gap-2 border-2 border-line px-6 py-[10px] font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:border-gold hover:text-gold"
        >
          Katalogga o'tish
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
