"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const BANNERS = [
  {
    image: "/promos/bestseller-hibattery.png",
    alt: "Best Seller – HiBattery AC Hoymiles, 1920 Wh de stockage",
    href: "/catalogue?search=hibattery",
  },
  {
    image: "/promos/bestseller-solplanet.png",
    alt: "Best Seller – Solplanet, onduleurs monophasés, triphasés, hybrides",
    href: "/catalogue?family=SOLPLANET",
  },
  {
    image: "/promos/promo-iq8.png",
    alt: "Promo – Série IQ8 Enphase, micro-onduleurs",
    href: "/catalogue?family=ENPHASE",
  },
];

export default function PromoBanners() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % BANNERS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="bg-surface py-10 lg:py-14">
      <div className="max-w-6xl mx-auto px-6">
        {/* ── Desktop: 3 cartes côte à côte ── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {BANNERS.map((banner) => (
            <Link
              key={banner.href}
              href={banner.href}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                sizes="(max-width: 1200px) 33vw, 400px"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            </Link>
          ))}
        </div>

        {/* ── Mobile: carrousel ── */}
        <div className="md:hidden">
          <Link
            href={BANNERS[current].href}
            className="block relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md"
          >
            {BANNERS.map((banner, i) => (
              <div
                key={banner.href}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === current ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </Link>
          <div className="flex justify-center gap-2 mt-4">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 bg-primary"
                    : "w-4 bg-primary/20 hover:bg-primary/40"
                }`}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
