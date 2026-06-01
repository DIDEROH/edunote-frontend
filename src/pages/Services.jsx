import React, { useRef } from 'react';
import { Card1 } from '../components/CardsComponents';
import {
  Code2,
  Smartphone,
  ShoppingCart,
  PenTool,
  Cloud,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { LinkArrowRight } from '../components/LinksComponents';
import { useAnimations } from '../utils/animations';
import { CtaGradient } from '../components/ButtonsComponents';


// Constantes pour les services

const services = [
  {
    id: "01",
    title: "Développement Web",
    description:
      "Sites vitrines, plateformes modernes et applications web performantes.",
    icon: Code2,
    color: "from-violet-500 to-blue-500",
  },
  {
    id: "02",
    title: "Développement Mobile",
    description:
      "Applications Android & iOS fluides avec une excellente expérience utilisateur.",
    icon: Smartphone,
    color: "from-fuchsia-500 to-purple-500",
  },
  {
    id: "03",
    title: "Solutions E-commerce",
    description:
      "Boutiques en ligne modernes avec paiements sécurisés et gestion intuitive.",
    icon: ShoppingCart,
    color: "from-util-500 to-rose-500",
  },
  {
    id: "04",
    title: "UI/UX Design",
    description:
      "Interfaces élégantes, intuitives et pensées pour captiver vos utilisateurs.",
    icon: PenTool,
    color: "from-cyan-500 to-emerald-500",
  },
  {
    id: "05",
    title: "Cloud & Hébergement",
    description:
      "Déploiement rapide, hébergement scalable et sécurité avancée.",
    icon: Cloud,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "06",
    title: "Maintenance & Support",
    description:
      "Mises à jour, optimisation continue et accompagnement technique.",
    icon: ShieldCheck,
    color: "from-yellow-500 to-orange-500",
  },
];


export default function Services() {

  const container = useRef(null)
  useAnimations(container)

  return (
    <div ref={container}>
      {/* Header */}
      <header className="animate-reveal relative mx-auto text-center bg-[url('/bg_secondary.webp')] bg-cover bg-center py-24 px-10">
        <div className='absolute w-full h-full bg-slate-900/60 inset-0 z-0'></div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium tracking-wide text-violet-300">
            NOS SERVICES
          </span>
        </div>

        <h2 className="relative text-4xl font-black leading-tight md:text-6xl text-white animate-reveal">
          Des solutions digitales
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent">
            pour vos ambitions
          </span>
        </h2>

        <p className="relative mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
          Nous créons des expériences numériques modernes, performantes
          et centrées sur vos utilisateurs.
        </p>
      </header>

      <div className="relative overflow-hidden pb-24 text-base-content px-6">
        {/* Background Glow */}
        <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-3xl" />

        <section className="relative z-10 mx-auto max-w-7xl">

          {/* Services Grid */}
          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              return (
                <Card1 key={service.id} data={service} btn={<LinkArrowRight text="En savoir plus" color="violet-400" abs={true} />} />
              );
            })}
          </div>

          {/* CTA */}
          <div className="relative mt-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl animate-slide-right">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-blue-600/70" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div>
                <h3 className="text-3xl font-bold">
                  Un projet en tête ?
                </h3>

                <p className="mt-3 max-w-xl text-base-content">
                  Nous vous accompagnons de l’idée jusqu’à la réalisation
                  complète de votre solution digitale.
                </p>
              </div>
              <CtaGradient text="Discutons de votre projet" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
