import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import {
  IconArrowRight,
  IconBall,
  IconCheck,
  IconShield,
  IconTag,
  IconTelegram,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "ALAN SPORT — Buxorodagi sport tovarlari do'koni. Bizning tariximiz, missiyamiz va qadriyatlarimiz bilan tanishing.",
};

export default function AboutPage() {
  return (
    <>
      {/* head */}
      <section 
        className="relative w-full border-b border-line bg-cover bg-[center_80%] bg-no-repeat py-10 md:py-14"
        style={{ backgroundImage: "linear-gradient(to right, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.75) 50%, rgba(11,11,12,0.88) 100%), url('/images/about-header-bg.jpg')" }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <p className="text-xs font-semibold tracking-widest text-mute uppercase">
            <Link href="/" className="transition hover:text-gold">Bosh sahifa</Link>
            <span className="mx-2 text-brand">/</span>
            <span className="text-gold">Biz haqimizda</span>
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold uppercase md:text-5xl">
            Biz haqimizda
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-mute md:text-base">
            ALAN SPORT — Buxoro shahridagi sportchilar va sog'lom turmush tarafi
            ishqibozlari uchun ishonchli manzil.
          </p>
        </div>
      </section>

      {/* story + storefront */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.3em] text-gold uppercase">
              Bizning tarix
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold uppercase md:text-4xl">
              Buxoro yuragidagi sport do'koni
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-mute md:text-base">
              <p>
                <span className="font-bold text-white">ALAN SPORT</span> do'koni Buxoro
                shahri, Xafiz Tanish Buxori ko'chasi, 10-uyda joylashgan bo'lib, necha
                yillardan beri shahar sportchilariga va sog'lom turmush tarzi
                ishqibozlariga xizmat ko'rsatib kelmoqda.
              </p>
              <p>
                Kichik savdo nuqtasidan boshlangan yo'limiz bugungi kunda shahardagi eng
                keng assortimentli sport do'konlaridan biriga aylandi: krossovkalar,
                sport kiyimlari, mashg'ulot anjomlari va aksessuarlar — barchasi bir
                joyda, yuqori sifatda va hamyonbop narxlarda.
              </p>
              <p>
                Kechqurun yorqin neon chiroqlar ostida porlab turadigan do'konimiz
                Buxoro sport hayotining ajralmas qismiga aylangan. Bizda har bir mijoz —
                professional sportchidan tortib maktab o'quvchisigacha — o'ziga mos
                mahsulotni topadi.
              </p>
              <p>
                Jamoamiz har bir xaridorda to'g'ri tanlov qilishga yordam beradi:
                o'lcham, brend va narx bo'yicha samimiy maslahat — bizning kundalik
                ishimiz.
              </p>
            </div>

            <ul className="mt-6 space-y-2.5">
              {[
                "Faqat tekshirilgan va sifatli mahsulotlar",
                "Doimiy yangilanib boruvchi assortiment",
                "Mijozlar uchun qulay narx va chegirmalar",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-semibold text-white">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-gold text-coal">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <figure className="clip-angle relative border border-line bg-panel p-2">
            <div className="relative overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="ALAN SPORT do'koni — kechqurun yorqin neon peshtoq"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-gold/40 ring-inset" />
            </div>
            <figcaption className="flex items-center justify-between gap-3 px-3 py-3 text-xs font-semibold text-mute">
              <span>Do'konimiz kechqurun — Buxoro, Xafiz Tanish Buxori ko'chasi, 10</span>
              <span className="shrink-0 text-gold">{SITE.hours}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* mission */}
      <section className="border-y border-line bg-coal">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="border-l-4 border-gold bg-panel p-6 md:p-10">
              <p className="font-display text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                Bizning missiya
              </p>
              <h2 className="mt-3 font-display text-2xl leading-snug font-bold uppercase md:text-3xl">
                Har bir sportchiga — sifatli jihoz, har bir narxga — hurmat
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-mute md:text-base">
                Missiyamiz — professional sportchilardan tortib sportni endi boshlagan
                havaskorlargacha bo'lgan har bir mijozga yuqori sifatli sport tovarlarini
                hamyonbop narxlarda taqdim etish. Biz uchun har bir mijoz — o'z
                jamoamizning a'zosi.
              </p>
            </div>

            <div className="grid gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  icon: <IconShield className="h-5 w-5" />,
                  title: "Sifat kafolati",
                  text: "Har bir mahsulot savdoga chiqishdan oldin tekshiruvdan o'tadi.",
                },
                {
                  icon: <IconBall className="h-5 w-5" />,
                  title: "Keng assortiment",
                  text: "Yuzlab mahsulotlar — krossovkadan mashg'ulot anjomlarigacha.",
                },
                {
                  icon: <IconTag className="h-5 w-5" />,
                  title: "Qulay narxlar",
                  text: "To'g'ridan-to'g'ri yetkazib beruvchilar bilan hamkorlik.",
                },
              ].map((v) => (
                <div key={v.title} className="group bg-coal p-5 transition hover:bg-panel">
                  <span className="flex h-10 w-10 items-center justify-center bg-brand text-white transition group-hover:bg-gold group-hover:text-coal">
                    {v.icon}
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold uppercase">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-mute">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/katalog"
              className="flex items-center gap-2 bg-brand px-6 py-3 font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:bg-flame"
            >
              Katalogni ko'rish
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 border-2 border-line px-6 py-[10px] font-display text-sm font-semibold tracking-[0.15em] uppercase transition hover:border-gold hover:text-gold"
            >
              <IconTelegram className="h-4 w-4" />
              Biz bilan bog'lanish
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
