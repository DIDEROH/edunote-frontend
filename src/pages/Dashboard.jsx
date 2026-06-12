import { useMemo } from "react";
import { FiFileText, FiUsers, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useHasRole } from "../hooks/useHasRole";

const stats = [
  {
    title: "Bulletins générés",
    value: "124",
    icon: FiFileText,
    description: "Voir les bulletins par classe ou établissement.",
    action: "Voir les bulletins",
    to: "/bulletins",
  },
  {
    title: "Enseignants actifs",
    value: "38",
    icon: FiUsers,
    description: "Gérez les affectations et les matières par enseignant.",
    action: "Gérer les enseignants",
    to: "/teachers/list",
  },
  {
    title: "Établissements",
    value: "12",
    icon: FiShield,
    description: "Supervisez les écoles et leurs directeurs.",
    action: "Voir les écoles",
    to: "/school",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const isAdmin = useHasRole("Admin");
  const isDirector = useHasRole("Director");

  const welcome = useMemo(() => {
    if (isDirector) {
      return {
        title: "Espace direction",
        subtitle: "Gérez vos enseignants, vos élèves et générez les bulletins de votre établissement.",
      };
    }

    if (isAdmin) {
      return {
        title: "Espace administration",
        subtitle: "Supervisez toutes les écoles, les chefs d'établissement et les performances globales.",
      };
    }

    return {
      title: "Bienvenue sur EduNote",
      subtitle: "Accédez à votre tableau de bord pour piloter vos classes et bulletins.",
    };
  }, [isAdmin, isDirector]);

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Tableau de bord</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">{welcome.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{welcome.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/bulletins")}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Générer un bulletin
            </button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                    <p className="mt-3 text-4xl font-semibold text-slate-950">{item.value}</p>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon size={20} />
                  </div>
                </div>
                <p className="mt-6 text-sm leading-6 text-slate-500">{item.description}</p>
                <button
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {item.action}
                </button>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Performance générale</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Suivez le taux de réussite de vos établissements, identifiez rapidement les classes en progression et priorisez les actions.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Saisie des notes</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Les enseignants saisissent les notes par compétence directement dans les classes qui leur sont affectées.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
