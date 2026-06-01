import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AVAILABLE_THEMES } from '../providers/ThemeProvider';
import { ChevronRight } from 'lucide-react';

export default function Settings() {
  const { theme, changeTheme } = useTheme();

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-secondary/10 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-2 py-24 lg:px-12">
        <section className="mb-12 rounded border border-base-content/10 bg-base-100/80 p-8 shadow-2xl shadow-base-content/10 backdrop-blur-xl">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-primary font-bold">
            Mode thème
          </span>
          <h1 className="mt-8 text-4xl md:text-5xl font-black tracking-tight text-base-content">
            Choisis ton univers visuel
          </h1>
          <p className="mt-4 max-w-3xl text-base-content/75 text-lg leading-relaxed">
            Parcours les différents thèmes DaisyUI et applique celui qui te plaît en direct.
            Chaque carte affiche un aperçu du rendu local pour te permettre de choisir en confiance.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {AVAILABLE_THEMES.map((themeName) => (
            <article
              key={themeName}
              data-theme={themeName}
              className={`animate-bento-card group relative overflow-hidden rounded-xl text-xs border border-base-content/10 bg-base-100 shadow-2xl transition-transform duration-300 hover:-translate-y-2 ${theme === themeName ? 'ring-2 ring-primary/70' : ''}`}
            >
              <div className="absolute inset-x-0 top-0 h-26 bg-linear-to-br from-primary/20 via-transparent to-secondary/0" />
              <div className="relative p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-base-content/50">Thème</p>
                    <h2 className="mt-3 text-xl font-black capitalize text-base-content">{themeName}</h2>
                  </div>
                  {theme === themeName ? (
                    <span className="badge badge-primary badge-outline">Actif</span>
                  ) : null}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="h-7 rounded bg-primary shadow-inner" />
                  <div className="h-7 rounded bg-secondary shadow-inner" />
                  <div className="h-7 rounded- bg-accent shadow-inner" />
                </div>

                <p className="mt-6 text-base-content/70 text-sm leading-relaxed">
                  Aperçu local du thème <span className="font-semibold">{themeName}</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => changeTheme(themeName)}
                className={`flex w-full items-center justify-between gap-3 border-t border-base-content/10 px-6 py-4 text-sm font-semibold transition ${theme === themeName ? 'text-primary' : 'text-base-content hover:text-primary'}`}
              >
                <span>{theme === themeName ? 'Thème actif' : 'Appliquer ce thème'}</span>
                <ChevronRight size={18} className="opacity-70 transition group-hover:translate-x-1" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
