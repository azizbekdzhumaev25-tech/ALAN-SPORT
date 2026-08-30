import type { Metadata } from "next";
import CatalogClient from "@/components/CatalogClient";

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "ALAN SPORT katalogi: krossovkalar, sport kiyimlari, anjomlar va aksessuarlar. O'lcham va kategoriya bo'yicha qulay qidiruv.",
};

export default function CatalogPage() {
  return <CatalogClient />;
}
