"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const SLIDES = [
  {
    title: "Votre distributeur\nsolutions énergétiques",
    highlight: "solutions énergétiques",
    subtitle: "Plus de 650 références en photovoltaïque, pompes à chaleur et climatisation. Stock réel, prix négociés, livraison rapide.",
    bg: "from-[#283084] via-[#283084] to-[#1a205a]",
    image: "/hero/hero-panneaux.jpg",
  },
  {
    title: "Panneaux photovoltaïques\nFrancilienne Energy",
    highlight: "Francilienne Energy",
    subtitle: "Notre marque propre : performance, fiabilité et disponibilité immédiate. Près d'un million de panneaux distribués en France.",
    bg: "from-[#3a7d1e] via-[#2d6517] to-[#1e4a0f]",
    image: "/hero/hero-install.jpg",
  },
  {
    title: "Pompes à chaleur &\nclimatisation pro",
    highlight: "climatisation pro",
    subtitle: "Airwell, Ariston, Panasonic — gamme complète PAC air-eau et air-air pour les installateurs professionnels.",
    bg: "from-[#a82020] via-[#8b1a1a] to-[#6d1414]",
    image: "/hero/hero-pac.jpg",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className={`relative bg-gradient-to-br ${slide.bg} text-white overflow-hidden transition-colors duration-700`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image overlay */}
      {slide.image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 transition-opacity duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      )}

      {/* Pattern decoratif */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Espace professionnel B2B
          </div>

          {/* Titre avec animation */}
          <h1
            key={current}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up"
          >
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line.includes(slide.highlight) ? (
                  <>
                    {line.split(slide.highlight)[0]}
                    <span className="text-green-300">{slide.highlight}</span>
                    {line.split(slide.highlight)[1]}
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p
            key={`sub-${current}`}
            className="text-lg lg:text-xl text-white/80 mb-8 max-w-xl animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {slide.subtitle}
          </p>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 mb-12">
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

        {/* Dots indicateurs */}
        <div className="flex gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-10 bg-white"
                  : "w-6 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 50L48 45.8C96 41.7 192 33.3 288 35.8C384 38.3 480 51.7 576 55.8C672 60 768 55 864 48.3C960 41.7 1056 33.3 1152 35.8C1248 38.3 1344 51.7 1392 58.3L1440 65V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="#f8fafc"/>
        </svg>
      </div>
    </section>
  );
}
