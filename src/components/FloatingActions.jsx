import { FiPrinter, FiHelpCircle } from "react-icons/fi";

const actions = [
  {
    label: "Imprimer",
    icon: FiPrinter,
    onClick: () => window.print(),
  },
  {
    label: "Aide",
    icon: FiHelpCircle,
    onClick: () => window.alert("Besoin d'aide ? Contactez l'administrateur.")
  },
];

export default function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Icon size={18} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
