import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FaMale,
  FaFemale,
} from "react-icons/fa";

const COLORS = ["#4F46E5", "#DB2777"];

export default function StudentPieChart({ data, title }) {
  const boys = data?.boys ?? 0;
  const girls = data?.girls ?? 0;

  const total = boys + girls;

  const chartData = [
    { name: "Garçons", value: boys },
    { name: "Filles", value: girls },
  ];

  return (
    <div className="rounded-md bg-base-200 p-6">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-base-content">
          {title ?? "Répartition des élèves"}
        </h2>
        <p className="text-xs text-base-content/60">
          Masculin / Féminin
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-center">

        {/* Donut */}
        <div className="relative h-[240px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-base-content">
              {total}
            </span>
            <span className="text-xs text-base-content/60">
              Élèves
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <GenderCard
            icon={<FaMale size={16} />}
            colorClass="bg-primary/10 text-primary"
            barClass="bg-primary"
            title="Masculins"
            value={boys}
            percent={total ? Math.round((boys / total) * 100) : 0}
          />

          <GenderCard
            icon={<FaFemale size={16} />}
            colorClass="bg-accent/10 text-accent"
            barClass="bg-accent"
            title="Féminins"
            value={girls}
            percent={total ? Math.round((girls / total) * 100) : 0}
          />
        </div>

      </div>

    </div>
  );
}

function GenderCard({ icon, title, value, percent, colorClass, barClass }) {
  return (
    <div className="rounded-md bg-base-100 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-md ${colorClass} flex items-center justify-center`}>
            {icon}
          </div>

          <div>
            <div className="text-sm font-medium text-base-content">{title}</div>
            <div className="text-xs text-base-content/60">{percent} %</div>
          </div>
        </div>

        <div className="text-xl font-semibold text-base-content">
          {value}
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-sm bg-base-300 overflow-hidden">
        <div className={`${barClass} h-full rounded-sm`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
