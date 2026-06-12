import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList
} from "recharts";

// Tooltip personnalisé pour un affichage propre des données
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-4 shadow-xl border border-slate-200 rounded-lg">
        <p className="font-bold text-indigo-900 mb-2">{label}</p>
        <p className="text-xs text-emerald-600 font-medium">✅ Admis : <strong>{d.admisCount}</strong></p>
        <p className="text-xs text-red-500 font-medium">❌ Non Admis : <strong>{d.nonAdmisCount}</strong></p>
        <hr className="my-2" />
        <p className="text-xs font-black text-slate-700">Taux de réussite : {d.fullRate}%</p>
      </div>
    );
  }
  return null;
};

export default function StatisticsDashboard({ data }) {
  
  // Fonction utilitaire sécurisée pour transformer les données API pour Recharts
  const prepareData = (items, nameKey) => {
    // Sécurité : si items est null ou undefined, on retourne un tableau vide
    if (!items || !Array.isArray(items)) return [];

    return items.map(item => {
      const total = Number(item.total_students) || 0;
      const passed = Number(item.passed_students) || 0;
      const rate = Number(item.pass_rate) || 0;
      const failed = total - passed;

      // Calcul des segments pour la barre empilée (Stacked Bar)
      // On divise le taux total au prorata des admis/non-admis
      return {
        name: item[nameKey] || "Inconnu",
        passedPart: total > 0 ? (passed / total) * rate : 0,
        failedPart: total > 0 ? (failed / total) * rate : 0,
        admisCount: passed,
        nonAdmisCount: failed,
        fullRate: rate
      };
    });
  };

  // Préparation des différentes sources de données
  const termData = prepareData(data.global_by_term, 'term').map(d => ({...d, name: `Trimestre ${d.name}`}));
  const schoolData = prepareData(data.by_school, 'school_name');
  const classroomData = prepareData(data.by_classroom, 'classroom_name');

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      
      {/* SECTION 1 : PAR TRIMESTRE (Affichée uniquement en mode "all-terms") */}
      {data.global_by_term && data.global_by_term.length > 0 && (
        <ChartSection 
            title="Comparaison des Trimestres" 
            chartData={termData} 
            color="indigo"
        />
      )}

      {/* SECTION 2 : PAR ÉCOLE */}
      {schoolData.length > 0 && (
        <ChartSection 
            title="Performance par Établissement" 
            chartData={schoolData} 
            isScrollable={schoolData.length > 4}
            color="indigo"
        />
      )}

      {/* SECTION 3 : PAR CLASSE */}
      {classroomData.length > 0 && (
        <ChartSection 
            title="Détails par Classe" 
            chartData={classroomData} 
            isScrollable={classroomData.length > 6} 
            color="blue" 
        />
      )}

    </div>
  );
}

// Sous-composant réutilisable pour les sections de graphiques
function ChartSection({ title, chartData, isScrollable = false, color = "indigo" }) {
  return (
    <section className="bg-slate-300 p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="font-black text-slate-700 text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
        <span className={`w-1 h-4 bg-${color}-500 rounded-full`}></span>
        {title}
      </h3>
      
      <div className={isScrollable ? "overflow-x-auto pb-3 custom-scrollbar" : ""}>
        <div style={{ minWidth: isScrollable ? `${chartData.length * 120}px` : '100%' }}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                interval={0}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
              
              {/* Partie Admis (Vert) */}
              <Bar dataKey="passedPart" name="Admis" stackId="stack" fill="#10b981" barSize={40}>
                 <LabelList dataKey="admisCount" position="center" style={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} />
              </Bar>
              
              {/* Partie Non Admis (Rouge) */}
              <Bar dataKey="failedPart" name="Non Admis" stackId="stack" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                 <LabelList dataKey="nonAdmisCount" position="center" style={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} />
                 {/* Score Total au dessus de la barre */}
                 <LabelList 
                    dataKey="fullRate" 
                    position="top" 
                    formatter={(v) => `${v}%`} 
                    style={{ fill: '#334155', fontSize: 12, fontWeight: '900' }} 
                    offset={10} 
                 />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}