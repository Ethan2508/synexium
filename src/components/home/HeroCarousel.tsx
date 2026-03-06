"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const SLIDES = [
  { image: "/hero/hero-panneaux.jpg", alt: "Panneaux photovoltaïques Francilienne Energy" },
  { image: "/hero/hero-install.jpg", alt: "Installation solaire professionnelle" },
  { image: "/hero/hero-pac.jpg", alt: "Pompes à chaleur et climatisation" },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ── Partie gauche : Titre ── */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Espace professionnel B2B
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
              Votre distributeur<br />
              <span className="text-green-300">solutions énergétiques</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md mb-8">
              Plus de 650 références en photovoltaïque, pompes à chaleur et climatisation.
              Stock réel, prix négociés, livraison rapide.
            </p>

            {/* 2 CTA */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 text-base font-bold bg-solar-green text-white rounded-xl hover:bg-solar-green/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Créer un compte pro
              </Link>
              <Link
                href="/catalogue"
                className="px-8 py-4 text-base font-bold bg-white/10 border-2 border-white rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm text-white"
              >
                Parcourir le catalogue
              </Link>
            </div>
          </div>

          {/* ── Partie droite : Carrousel image ── */}
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Image principale */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white/5">
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}

              {/* Overlay dégradé bas */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-solar-green"
                      : "w-4 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Grille stats (petits badges) */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 text-center">
                <p className="text-xl font-extrabold text-solar-green">650+</p>
                <p className="text-[11px] text-white/60">Références</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 text-center">
                <p className="text-xl font-extrabold text-solar-green">10 MW</p>
                <p className="text-[11px] text-white/60">En stock</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 text-center">
                <p className="text-xl font-extrabold text-solar-green">2009</p>
                <p className="text-[11px] text-white/60">Depuis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
