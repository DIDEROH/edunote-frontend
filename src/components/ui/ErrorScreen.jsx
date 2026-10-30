import { useNavigate } from "react-router-dom";
import { m } from "motion/react";
import { ArrowLeft, Home } from "lucide-react";
import Logo from "../elements/Logo";
import { popIn } from "../motion/variants";

/** Page d'erreur (404, 403) posée sur le fond d'écran */
export default function ErrorScreen({ code, icon: Icon, title, text }) {
  const navigate = useNavigate();

  return (
    <main className="on-dark relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="app-backdrop" aria-hidden="true" />
      <m.section variants={popIn} initial="hidden" animate="show" className="glass-panel glow-top w-full max-w-lg p-10 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center overflow-hidden rounded-2xl bg-white p-0.5 shadow-xl shadow-black/40">
          <Logo className="h-full w-full object-contain" />
        </span>
        <p className="mt-8 bg-linear-to-r from-glow-cyan via-glow-indigo to-glow-pink bg-clip-text text-7xl font-semibold tracking-tight text-transparent">
          {code}
        </p>
        <h1 className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-white">
          {Icon && <Icon size={20} className="text-glow-pink" />} {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">{text}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={() => navigate(-1)} className="ui-btn ui-btn-ghost text-white/80">
            <ArrowLeft size={16} /> Retour
          </button>
          <button type="button" onClick={() => navigate("/")} className="ui-btn ui-btn-primary">
            <Home size={16} /> Accueil
          </button>
        </div>
      </m.section>
    </main>
  );
}
