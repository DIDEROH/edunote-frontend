import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  ArrowLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-6">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f020_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f020_1px,transparent_1px)] bg-[size:48px_48px]" />

      </div>

      <section className="relative z-10 w-full max-w-xl">

        <div className="rounded-[38px] border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(15,23,42,.08)] p-10 md:p-14 text-center">

          <Logo className="mx-auto w-24 h-24 rounded-3xl shadow-lg" />

          <div className="mt-10">

            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1 text-xs font-bold tracking-[0.25em] uppercase text-indigo-600">
              Erreur
            </span>

            <h1 className="mt-6 text-7xl md:text-8xl font-black tracking-tight text-slate-900">
              404
            </h1>

            <h2 className="mt-4 text-2xl font-bold text-slate-800">
              Page introuvable
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 max-w-md mx-auto">
              La page que vous recherchez n'existe plus, a été déplacée
              ou l'adresse saisie est incorrecte.
            </p>

          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">

            <button
              onClick={() => navigate(-1)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Retour
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <HomeIcon className="w-5 h-5" />
              Accueil
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default NotFound;