import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  ArrowLeftIcon,
  HomeIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

function Forbidden() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-6">

      {/* Arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f020_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f020_1px,transparent_1px)] bg-[size:48px_48px]" />

      </div>

      <section className="relative z-10 w-full max-w-xl">

        <div className="rounded-[38px] border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(15,23,42,.08)] p-10 md:p-14 text-center">


          <div>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
              <ShieldExclamationIcon className="h-10 w-10" />
            </div>

            <span className="mt-6 inline-flex items-center rounded-full bg-amber-100 px-4 py-1 text-xs font-bold tracking-[0.25em] uppercase text-amber-700">
              Accès refusé
            </span>

            <h1 className="mt-6 text-7xl md:text-8xl font-black tracking-tight text-slate-900">
              403
            </h1>

            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              Vous n'avez pas les autorisations nécessaires
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 max-w-md mx-auto">
              Cette ressource est protégée. Vous ne disposez pas des droits
              nécessaires pour accéder à cette page ou effectuer cette
              opération.
            </p>

          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">

            <button
              onClick={() => navigate('/')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:text-amber-700 hover:shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Retour
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <HomeIcon className="w-5 h-5" />
              Retour à l'accueil
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Forbidden;