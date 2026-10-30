import { Link } from "react-router-dom";
import { m } from "motion/react";
import { Menu } from "lucide-react";
import { iconFor } from "./navIcons";

/**
 * Barre de navigation du téléphone, posée en bas de l'écran : les quatre
 * premières pages du menu, et « Menu » pour le reste.
 */
export default function BottomDock({ pages, active, onOpenMenu }) {
  const shortcuts = pages.slice(0, 4);

  return (
    <nav
      aria-label="Navigation rapide"
      className="glass-panel fixed inset-x-3 bottom-3 z-40 flex items-stretch bg-night/95 justify-between px-1.5 py-1.5 shadow-2xl shadow-black/40 lg:hidden"
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
            className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors ${isActive ? "text-white" : "text-white/55"}`}
          >
            {isActive && (
              <m.span layoutId="dock-active" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
            )}
            <Icon size={18} className={`relative ${isActive ? "text-glow-cyan" : ""}`} />
            <span className="relative max-w-full truncate">{page.name}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onOpenMenu}
        className="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium text-white/55 transition-colors hover:text-white">
        <Menu size={18} />
        <span>Menu</span>
      </button>
    </nav>
  );
}
