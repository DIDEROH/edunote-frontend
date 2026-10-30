import { useEffect, useState } from "react";

/**
 * Chargement d'une page : squelette qui scintille dans des panneaux, et, si
 * l'attente se prolonge, un message de patience discret.
 */
export default function LoadingSkeleton({ message = "Chargement des données…" }) {
  const [long, setLong] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLong(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="shimmer h-8 w-64 max-w-full opacity-60" />
        <div className="shimmer h-4 w-96 max-w-full opacity-40" />
      </div>

      <div className="surface space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="shimmer size-12 rounded-2xl" />
          <div className="flex-1 space-y-2.5">
            <div className="shimmer h-4 w-48" />
            <div className="shimmer h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="shimmer h-16" />)}
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="shimmer h-10" style={{ opacity: 1 - i * 0.15 }} />)}
        </div>
      </div>

      <div
        className={`glass-panel mx-auto flex w-fit items-center gap-3 px-4 py-2 text-xs text-white/70 transition-opacity duration-500 ${long ? "opacity-100" : "opacity-0"}`}
      >
        <span className="pulse-dot" />
        {message} Merci de patienter un instant.
      </div>
    </div>
  );
}
