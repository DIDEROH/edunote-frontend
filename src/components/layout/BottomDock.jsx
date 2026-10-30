import { Link } from "react-router-dom";
import { m } from "motion/react";
import { Menu } from "lucide-react";
import { iconFor } from "./navIcons";

/**
 * Barre de navigation du téléphone, posée en bas de l'écran : les quatre
 * premières pages du menu (libellé court `short`), et « Menu » pour le reste.
 * Les cases se partagent la largeur (min-w-0), « Menu » un peu moins : rien ne
 * déborde, même à 320 px.
 */
export default function BottomDock({ pages, active, onOpenMenu }) {
  const shortcuts = pages.slice(0, 4);

  return (
    <nav
      aria-label="Navigation rapide"
      className="bottom-dock glass-panel fixed inset-x-3 bottom-3 z-40 flex items-stretch bg-night/95 justify-between px-1 py-1.5 shadow-2xl shadow-black/40 lg:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      {shortcuts.map((page) => {
        const Icon = iconFor(page.icon);
        const isActive = active?.to === page.to;
        return (
          <Link
            key={page.to}
            to={page.to}
            aria-current={isActive ? "page" : undefined}
            aria-label={page.name}
            title={page.name}
            className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium transition-colors ${isActive ? "text-white" : "text-white/55"}`}
          >
            {isActive && (
              <m.span layoutId="dock-active" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
            )}
            <Icon size={18} className={`relative shrink-0 ${isActive ? "text-glow-cyan" : ""}`} />
            <span className="relative w-full truncate text-center tracking-tight">{page.short ?? page.name}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onOpenMenu}
        className="flex min-w-0 flex-[0.7] flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium text-white/55 transition-colors hover:text-white">
        <Menu size={18} className="shrink-0" />
        <span className="w-full truncate text-center tracking-tight">Menu</span>
      </button>
    </nav>
  );
}
