import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Text } from "recharts";

const COLORS = ["#10b981", "#f43f5e"]; // Vert émeraude et Rose/Rouge vif

export default function GlobalSuccessPie({ data }) {
  const total = Number(data.global.total_students);
  const passed = Number(data.global.passed_students);
  const failed = total - passed;
  const successRate = ((passed / total) * 100).toFixed(1);

  const chartData = [
    { name: "Réussis", value: passed },
    { name: "Échoués", value: failed },
  ];

  return (
    <div className="w-full h-[380px] bg-slate-300 p-6 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center">
      <h3 className="text-indigo-800 uppercase font-black mb-4 text-center">
        Taux de Réussite global des élèves
      </h3>
      
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70} // Transforme le camembert en Donut
              outerRadius={100}
              paddingAngle={5} // Espace entre les segments
              stroke="none"
              animationBegin={200}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Texte au centre du Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-800">{successRate}%</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Succès</span>
        </div>
      </div>

      {/* Légende personnalisée en bas */}
      <div className="flex gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10b981]" />
          <span className="text-sm text-slate-600 font-medium">Réussis ({passed})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f43f5e]" />
          <span className="text-sm text-slate-600 font-medium">Échoués ({failed})</span>
        </div>
      </div>
    </div>
  );
}