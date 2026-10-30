import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { CornerDownLeft, Search, UserRound } from "lucide-react";
import { popIn } from "../motion/variants";
import { iconFor } from "./navIcons";

// Recherche sans accents ni majuscules (« eleves » trouve « Élèves »)
const normalize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Recherche rapide (Ctrl + K) : aller à une page en tapant son nom,
 * flèches pour choisir, Entrée pour ouvrir.
 */
export default function CommandPalette({ open, onClose, pages }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const items = useMemo(() => {
    const all = [...pages, { name: "Mon profil", to: "/profile", icon: null }];
    const q = normalize(query.trim());
    return q ? all.filter((item) => normalize(item.name).includes(q)) : all;
  }, [pages, query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const go = (item) => {
    if (!item) return;
    onClose();
    setQuery("");
    setIndex(0);
    navigate(item.to);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(items[index]);
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Recherche rapide"
        >
          <m.div variants={popIn} initial="hidden" animate="show" exit="exit" className="surface w-full max-w-lg overflow-hidden">
            <div className="flex items-center gap-3 border-b border-base-300 px-4 py-3.5">
              <Search size={18} className="text-base-content/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
                onKeyDown={onKeyDown}
                placeholder="Aller à une page…"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-base-content/40"
              />
              <kbd className="rounded-md bg-base-100 px-1.5 py-0.5 text-[10px] font-semibold text-base-content/50 ring-1 ring-base-300">Échap</kbd>
            </div>
            <ul ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-base-content/50">Aucune page ne correspond.</li>}
              {items.map((item, i) => {
                const Icon = item.icon ? iconFor(item.icon) : UserRound;
                const selected = i === index;
                return (
                  <li key={item.to}>
                    <button
                      type="button"
                      data-index={i}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${selected ? "bg-primary/8 text-primary" : "text-base-content/80"}`}
                    >
                      <span className={`grid size-8 place-items-center rounded-lg ${selected ? "bg-primary text-white" : "bg-base-100 text-base-content/60"}`}>
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 font-medium">{item.name}</span>
                      {selected && <CornerDownLeft size={14} className="text-primary/70" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
