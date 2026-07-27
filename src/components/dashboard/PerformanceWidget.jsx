import { Users, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';


// Composant utilitaire pour les mini-barres de progression dans le tableau
const MiniProgressBar = ({ value, type = 'success' }) => {
  const isSuccess = type === 'success';
  const colorClass = isSuccess ? 'bg-emerald-500' : 'bg-rose-500';
  const bgClass = isSuccess ? 'bg-emerald-100' : 'bg-rose-100';

  return (
    <div className={`h-1.5 w-full rounded-full overflow-hidden ${bgClass}`}>
      <div 
        className={`h-full ${colorClass} transition-all duration-500`}
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
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      
      {/* Section Supérieure : Résumé Global */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-800">Performances des élèves</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Global Inscrits */}
          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Effectif Total
            </span>
            <span className="text-2xl font-bold text-slate-800 mt-1">{global.inscrits.total}</span>
            <div className="text-xs text-slate-400 mt-auto pt-2 flex gap-3">
              <span>G: <strong className="text-slate-600">{global.inscrits.garcons}</strong></span>
              <span>F: <strong className="text-slate-600">{global.inscrits.filles}</strong></span>
            </div>
          </div>

          {/* Global Admis */}
          <div className="bg-white p-4 rounded-lg border border-emerald-100/50 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Taux de Réussite
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-700">{global.admis.taux}%</span>
              <span className="text-sm text-emerald-600/70 font-medium">({global.admis.total})</span>
            </div>
            <div className="text-xs text-emerald-600/60 mt-auto pt-2 flex gap-3">
              <span>G: <strong className="text-emerald-700">{global.admis.garcons}</strong></span>
              <span>F: <strong className="text-emerald-700">{global.admis.filles}</strong></span>
            </div>
          </div>

          {/* Global Echecs */}
          <div className="bg-white p-4 rounded-lg border border-rose-100/50 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-rose-600 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> Taux d'Échec
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-rose-700">{global.echecs.taux}%</span>
              <span className="text-sm text-rose-600/70 font-medium">({global.echecs.total})</span>
            </div>
            <div className="text-xs text-rose-600/60 mt-auto pt-2 flex gap-3">
              <span>G: <strong className="text-rose-700">{global.echecs.garcons}</strong></span>
              <span>F: <strong className="text-rose-700">{global.echecs.filles}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Inférieure : Détails par classe */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Classe</th>
              <th scope="col" className="px-5 py-3 font-medium">Inscrits (G/F)</th>
              <th scope="col" className="px-5 py-3 font-medium">Réussite</th>
              <th scope="col" className="px-5 py-3 font-medium">Échec</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {by_classroom.map((classe, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors bg-white">
                
                {/* Nom Classe */}
                <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-800">
                  {classe.nom_classe}
                </td>
                
                {/* Inscrits */}
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">{classe.inscrits.total} élèves</span>
                    <span className="text-xs text-slate-400">
                      {classe.inscrits.garcons} garçons, {classe.inscrits.filles} filles
                    </span>
                  </div>
                </td>

                {/* Admis */}
                <td className="px-5 py-3.5 min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-emerald-600">{classe.admis.taux}%</span>
                    <span className="text-xs text-emerald-600/70">{classe.admis.total} admis (G:{classe.admis.garcons}/F:{classe.admis.filles})</span>
                  </div>
                  <MiniProgressBar value={classe.admis.taux} type="success" />
                </td>

                {/* Echecs */}
                <td className="px-5 py-3.5 min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-rose-600">{classe.echecs.taux}%</span>
                    <span className="text-xs text-rose-600/70">{classe.echecs.total} échecs (G:{classe.echecs.garcons}/F:{classe.echecs.filles})</span>
                  </div>
                  <MiniProgressBar value={classe.echecs.taux} type="danger" />
                </td>

              </tr>
            ))}
            
            {by_classroom.length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
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