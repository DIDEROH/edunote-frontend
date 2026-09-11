import { Users, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';


// Composant utilitaire pour les mini-barres de progression dans le tableau
const MiniProgressBar = ({ value, type = 'success' }) => {
  const isSuccess = type === 'success';
  const colorClass = isSuccess ? 'bg-success' : 'bg-error';

  return (
    <div className="h-1.5 w-full rounded-sm overflow-hidden bg-base-300">
      <div
        className={`h-full rounded-sm ${colorClass} transition-all duration-300`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

export default function PerformanceWidget({ performance = {} }) {
  // Sécurisation au cas où les données ne seraient pas encore chargées
  if (!performance || !performance.global) return null;

  const { global, by_classroom } = performance;

  return (
    <div className="w-full bg-base-200 rounded-md overflow-hidden">

      {/* Section Supérieure : Résumé Global */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-base-content/50" />
          <h2 className="text-sm font-semibold text-base-content">Performances des élèves</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Global Inscrits */}
          <div className="bg-base-100 p-4 rounded-md flex flex-col">
            <span className="text-xs font-medium text-base-content/60 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Effectif Total
            </span>
            <span className="text-xl font-semibold text-base-content mt-1">{global.inscrits.total}</span>
            <div className="text-xs text-base-content/50 mt-auto pt-2 flex gap-3">
              <span>G: <strong className="text-base-content/70">{global.inscrits.garcons}</strong></span>
              <span>F: <strong className="text-base-content/70">{global.inscrits.filles}</strong></span>
            </div>
          </div>

          {/* Global Admis */}
          <div className="bg-success/10 p-4 rounded-md flex flex-col">
            <span className="text-xs font-medium text-success flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Taux de Réussite
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-semibold text-success">{global.admis.taux}%</span>
              <span className="text-xs text-success/70 font-medium">({global.admis.total})</span>
            </div>
            <div className="text-xs text-success/70 mt-auto pt-2 flex gap-3">
              <span>G: <strong>{global.admis.garcons}</strong></span>
              <span>F: <strong>{global.admis.filles}</strong></span>
            </div>
          </div>

          {/* Global Echecs */}
          <div className="bg-error/10 p-4 rounded-md flex flex-col">
            <span className="text-xs font-medium text-error flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" /> Taux d'Échec
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-semibold text-error">{global.echecs.taux}%</span>
              <span className="text-xs text-error/70 font-medium">({global.echecs.total})</span>
            </div>
            <div className="text-xs text-error/70 mt-auto pt-2 flex gap-3">
              <span>G: <strong>{global.echecs.garcons}</strong></span>
              <span>F: <strong>{global.echecs.filles}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Inférieure : Détails par classe */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-base-content/50">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Classe</th>
              <th scope="col" className="px-5 py-3 font-medium">Inscrits (G/F)</th>
              <th scope="col" className="px-5 py-3 font-medium">Réussite</th>
              <th scope="col" className="px-5 py-3 font-medium">Échec</th>
            </tr>
          </thead>
          <tbody>
            {by_classroom.map((classe, idx) => (
              <tr key={idx} className={`transition-colors duration-150 hover:bg-base-300 ${idx % 2 === 1 ? 'bg-zebra' : ''}`}>

                {/* Nom Classe */}
                <td className="px-5 py-3 whitespace-nowrap font-medium text-base-content">
                  {classe.nom_classe}
                </td>

                {/* Inscrits */}
                <td className="px-5 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-base-content/80">{classe.inscrits.total} élèves</span>
                    <span className="text-xs text-base-content/50">
                      {classe.inscrits.garcons} garçons, {classe.inscrits.filles} filles
                    </span>
                  </div>
                </td>

                {/* Admis */}
                <td className="px-5 py-3 min-w-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-success">{classe.admis.taux}%</span>
                    <span className="text-xs text-success/70">{classe.admis.total} admis (G:{classe.admis.garcons}/F:{classe.admis.filles})</span>
                  </div>
                  <MiniProgressBar value={classe.admis.taux} type="success" />
                </td>

                {/* Echecs */}
                <td className="px-5 py-3 min-w-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-error">{classe.echecs.taux}%</span>
                    <span className="text-xs text-error/70">{classe.echecs.total} échecs (G:{classe.echecs.garcons}/F:{classe.echecs.filles})</span>
                  </div>
                  <MiniProgressBar value={classe.echecs.taux} type="danger" />
                </td>

              </tr>
            ))}

            {by_classroom.length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-base-content/40">
                  Aucune donnée disponible pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
