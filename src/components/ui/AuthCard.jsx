import { m } from "motion/react";
import { BellRing, FileCheck2, WifiOff } from "lucide-react";
import Logo from "../elements/Logo";
import TopProgress from "./TopProgress";
import { Appname } from "../../constants/constants";
import { fadeUp, popIn, stagger } from "../motion/variants";

const FEATURES = [
  { icon: WifiOff, title: "Saisie des notes, même hors ligne", text: "Les notes partent toutes seules dès que le réseau revient." },
  { icon: FileCheck2, title: "Bulletins officiels prêts à imprimer", text: "Moyennes, rangs et appréciations calculés pour vous." },
  { icon: BellRing, title: "Toute l'école sous les yeux", text: "Suivi de la saisie, relances WhatsApp, historique des notes." },
];

/**
 * Écrans d'accès (connexion, inscription, invitation, mot de passe oublié) :
 * photo de fond, présentation d'EduNote à gauche, formulaire sur un panneau clair.
 */
export default function AuthCard({ icon: Icon, title, description, footer, children, size = "max-w-md" }) {
  return (
    <div className="on-dark relative min-h-dvh">
      <div className="app-backdrop" aria-hidden="true" />
      <TopProgress />

      <div className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        {/* Présentation (ordinateur) */}
        <m.section className="hidden lg:block" variants={stagger(0.08, 0.1)} initial="hidden" animate="show">
          <m.div variants={fadeUp} className="flex items-center gap-3">
            <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white p-0.5 shadow-xl shadow-black/40">
              <Logo className="h-full w-full object-contain" />
            </span>
            <span className="text-xl font-semibold tracking-tight text-white">{Appname}</span>
          </m.div>
          <m.span variants={fadeUp} className="kicker mt-10 text-white/75">Gestion scolaire camerounaise</m.span>
          <m.h2 variants={fadeUp} className="mt-4 max-w-lg text-4xl leading-[1.1] font-semibold tracking-tight text-white xl:text-[2.75rem]">
            Les notes, les bulletins et toute l'école,{" "}
            <span className="bg-linear-to-r from-glow-cyan via-glow-indigo to-glow-pink bg-clip-text text-transparent">au même endroit.</span>
          </m.h2>
          <m.ul variants={stagger(0.08)} className="mt-10 space-y-5">
            {FEATURES.map(({ icon: FeatureIcon, title: featureTitle, text }) => (
              <m.li key={featureTitle} variants={fadeUp} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/8 text-glow-cyan ring-1 ring-white/12">
                  <FeatureIcon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{featureTitle}</span>
                  <span className="block text-sm text-white/55">{text}</span>
                </span>
              </m.li>
            ))}
          </m.ul>
        </m.section>

        {/* Formulaire */}
        <m.div variants={popIn} initial="hidden" animate="show" className={`surface w-full justify-self-center p-7 sm:p-9 ${size}`}>
          <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center overflow-hidden rounded-xl bg-white p-0.5 ring-1 ring-base-300">
              <Logo className="h-full w-full object-contain" />
            </span>
            <span className="font-semibold tracking-tight">{Appname}</span>
          </div>

          <div className="mb-7">
            {Icon && (
              <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-linear-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/30">
                <Icon size={22} />
              </span>
            )}
            <h1 className="text-xl leading-snug font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1.5 text-sm leading-relaxed text-base-content/60">{description}</p>}
          </div>

          <div className="flex flex-col gap-4">{children}</div>

          {footer && <div className="mt-7 border-t border-base-300 pt-5 text-center text-sm text-base-content/60">{footer}</div>}
        </m.div>
      </div>
    </div>
  );
}
