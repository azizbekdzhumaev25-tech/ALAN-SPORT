import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import { CATEGORY_LABELS, SITE, formatPrice, type CategoryKey } from "@/lib/site";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";
import { IconArrowRight, IconShield, IconTruck } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const idStr = String(resolvedParams.id);
  const products = getProducts();
  const product = products.find((p) => String(p.id) === idStr);

  if (!product) {
    notFound();
  }

  const sizes = (product.sizes ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const discount = product.oldPrice
    ? Math.max(1, Math.round((1 - product.price / product.oldPrice) * 100))
    : 0;

  const gallery =
    Array.isArray((product as any).images) && (product as any).images.length > 0
      ? (product as any).images
      : product.image
        ? [product.image]
        : [];

  const related = products
    .filter((p) => p.category === product.category && String(p.id) !== idStr)
    .slice(0, 4);

  return (
    <>
      {/* breadcrumb */}
      <section className="border-b border-line bg-coal">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-xs font-semibold tracking-widest text-mute uppercase">
            <Link href="/" className="transition hover:text-gold">
              Bosh sahifa
            </Link>
            <span className="mx-2 text-brand">/</span>
            <Link href="/katalog" className="transition hover:text-gold">
              Katalog
            </Link>
            <span className="mx-2 text-brand">/</span>
            <span className="text-gold">{product.name}</span>
          </p>
        </div>
      </section>

      {/* main product */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* gallery */}
          <ProductGallery images={gallery} alt={product.name} discount={discount} />

          {/* info */}
          <div className="flex flex-col">
            <p className="font-display text-xs font-semibold tracking-[0.25em] text-gold uppercase">
              {CATEGORY_LABELS[product.category as CategoryKey] ?? product.category}
            </p>

            <h1 className="mt-3 font-display text-2xl font-bold uppercase leading-tight sm:text-3xl md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <p className="font-display text-2xl font-bold text-gold sm:text-3xl md:text-4xl">
                {formatPrice(product.price)}
                <span className="ml-2 text-xs sm:text-sm font-semibold text-mute">so'm</span>
              </p>
              {product.oldPrice && (
                <p className="text-base font-semibold text-mute line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
            </div>

            {product.description && (
              <p className="mt-5 text-sm leading-relaxed text-mute md:text-base">
                {product.description}
              </p>
            )}

            {/* client actions */}
            <div className="mt-8">
              <ProductActions product={product as any} sizes={sizes} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 border border-line bg-panel px-4 py-3">
                <IconTruck className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs font-bold uppercase text-white">Tez yetkazib berish</p>
                  <p className="text-[11px] text-mute">Buxoro bo'ylab</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-line bg-panel px-4 py-3">
                <IconShield className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs font-bold uppercase text-white">Sifat kafolati</p>
                  <p className="text-[11px] text-mute">Tekshirilgan mahsulot</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-mute">
              Manzil: {SITE.address} • {SITE.hours}
            </div>
          </div>
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-line bg-coal">
          <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                  O'xshash mahsulotlar
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold uppercase md:text-3xl">
                  Yana tavsiya qilamiz
                </h2>
              </div>
              <Link
                href={`/katalog?cat=${product.category}`}
                className="hidden items-center gap-2 font-display text-xs font-semibold tracking-widest text-mute uppercase transition hover:text-brand sm:flex"
              >
                Barchasi <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group border border-line bg-panel transition hover:border-brand/70"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-panel2">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-display text-xs md:text-sm font-semibold uppercase text-white group-hover:text-gold line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 md:mt-2 font-display text-sm md:text-base font-bold text-gold">
                      {formatPrice(p.price)}{" "}
                      <span className="text-[10px] md:text-xs font-semibold text-mute">so'm</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}