import Logo from "../elements/Logo";

/** Écran d'ouverture pendant la vérification de la session */
export default function AppSplash() {
  return (
    <div className="on-dark relative grid min-h-dvh place-items-center" aria-busy="true">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="flex flex-col items-center gap-5">
        <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white p-1 shadow-2xl shadow-black/50">
          <Logo className="h-full w-full object-contain" />
        </span>
        <span className="flex items-center gap-2.5 text-sm text-white/60">
          <span className="ui-spinner text-glow-cyan" /> Ouverture de votre espace…
        </span>
      </div>
    </div>
  );
}
