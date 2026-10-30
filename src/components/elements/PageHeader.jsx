import { Search } from "lucide-react";
import { Reveal } from "../motion/Reveal";

/**
 * En-tête des pages, posé sur le fond d'écran : petite étiquette, titre,
 * sous-titre, et à droite une recherche (onSearch) ou des actions (children).
 */
export default function PageHeader({
  title = "Tableau de bord",
  subtitle = "Bienvenue sur votre espace de gestion",
  kicker,
  searchPlaceholder = "Rechercher...",
  onSearch,
  children,
}) {
  return (
    <Reveal as="header" className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {kicker && <span className="kicker mb-3 text-white/70">{kicker}</span>}
        <h1 className="text-[1.6rem] leading-tight font-semibold tracking-tight text-white sm:text-[1.85rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-white/60">{subtitle}</p>}
      </div>

      {(onSearch || children) && (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          {onSearch && (
            <label className="flex w-full items-center gap-2.5 rounded-full bg-white/8 px-4 py-2.5 ring-1 ring-white/12 backdrop-blur-md transition focus-within:bg-white/12 focus-within:ring-glow-indigo/60 lg:w-80">
              <Search size={16} className="shrink-0 text-white/50" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </label>
          )}
          {children}
        </div>
      )}
    </Reveal>
  );
}
