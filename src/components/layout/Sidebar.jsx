import { Link } from "react-router-dom";
import { m } from "motion/react";
import { PanelLeftClose, PanelLeftOpen, Phone } from "lucide-react";
import Logo from "../elements/Logo";
import { Appname, VERSION } from "../../constants/constants";
import { useAuth } from "../../context/AuthContext";
import { iconFor } from "./navIcons";

/**
 * Barre latérale en verre sombre : logo, établissement, liens du menu.
 * Sur ordinateur elle peut se replier (icônes seules) ; sur téléphone c'est un
 * tiroir ouvert depuis la barre du haut ou la barre du bas.
 */
export default function Sidebar({ pages, active, collapsed, onToggleCollapsed, onNavigate, mobile = false }) {
  const { school } = useAuth();
  const compact = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col">
      {/* Marque */}
      <div className={`flex items-center gap-3 px-4 pt-5 pb-4 ${compact ? "justify-center px-0" : ""}`}>
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-lg shadow-black/30 ring-1 ring-white/20">
          <Logo className="h-full w-full object-contain" />
        </span>
        {!compact && (
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-tight text-white">{Appname}</p>
            <p className="truncate text-[11px] text-white/50">{school?.name || "Gestion scolaire"}</p>
          </div>
        )}
      </div>

      {!compact && <p className="eyebrow px-5 pt-2 pb-2 text-white/35">Navigation</p>}

      {/* Liens */}
      <nav className={`flex-1 space-y-1 overflow-y-auto pb-4 ${compact ? "px-2.5" : "px-3"}`} aria-label="Menu principal">
        {pages.map((page) => {
          const Icon = iconFor(page.icon);
          const isActive = active?.to === page.to;
          return (
            <Link
              key={page.to}
              to={page.to}
              onClick={onNavigate}
              title={compact ? page.name : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                compact ? "justify-center px-0" : "px-3"
              } ${isActive ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              {isActive && (
                <m.span
                  layoutId={mobile ? "nav-active-mobile" : "nav-active"}
                  className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              {isActive && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-linear-to-b from-glow-cyan to-glow-indigo shadow-[0_0_10px] shadow-glow-cyan/70" />}
              <Icon size={18} className={`relative shrink-0 transition-colors ${isActive ? "text-glow-cyan" : "text-white/55 group-hover:text-white"}`} />
              {!compact && <span className="relative truncate">{page.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Pied : version, contact, repli */}
      <div className={`border-t border-white/8 px-4 py-4 ${compact ? "px-2" : ""}`}>
        {!compact && (
          <div className="mb-3 space-y-0.5 text-[11px] text-white/40">
            <p>{Appname} {VERSION} · par Durinfo</p>
            <a href="tel:+237680680053" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <Phone size={11} /> +237 680 680 053
            </a>
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`ui-btn ui-btn-ghost ui-btn-sm w-full text-white/60 ${compact ? "px-0" : "justify-start"}`}
            title={compact ? "Déplier le menu" : "Replier le menu"}
          >
            {compact ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Replier</>}
          </button>
        )}
      </div>
    </div>
  );
}
