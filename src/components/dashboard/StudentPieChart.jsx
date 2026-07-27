import { motion } from "framer-motion";
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

const COLORS = [
  "#3B82F6",
  "#EC4899",
];

export default function StudentPieChart({ data, title }) {
  const boys = data?.boys ?? 0;
  const girls = data?.girls ?? 0;

  const total = boys + girls;

  const chartData = [
    {
      name: "Garçons",
      value: boys,
    },
    {
      name: "Filles",
      value: girls,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6"
    >
      <div className="mb-8">

        <h2 className="text-2xl font-bold text-slate-800">
          {title ?? "Répartition des élèves"}
        </h2>

        <p className="text-slate-500">
          Masculin / Feminin
        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-center">

        {/* Donut */}

        <div className="relative h-[280px]">

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={4}
                stroke="white"
                strokeWidth={5}
              >
                {
                  chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />
                  ))
                }
              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

          {/* Centre */}

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

            <span className="text-5xl font-black text-slate-800">

              {total}

            </span>

            <span className="text-slate-500">

              Élèves

            </span>

          </div>

        </div>

        {/* Stats */}

        <div className="space-y-5">

          <GenderCard
            icon={<FaMale />}
            color="bg-blue-500"
            title="Masculins"
            value={boys}
            percent={total ? Math.round((boys / total) * 100) : 0}
          />

          <GenderCard
            icon={<FaFemale />}
            color="bg-pink-500"
            title="Feminins"
            value={girls}
            percent={total ? Math.round((girls / total) * 100) : 0}
          />

        </div>

      </div>

    </motion.div>
  );
}

function GenderCard({
  icon,
  title,
  value,
  percent,
  color,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">

      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">

          <div className={`h-12 w-12 rounded-xl ${color} text-white flex items-center justify-center`}>

            {icon}

          </div>

          <div>

            <div className="font-bold">

              {title}

            </div>

            <div className="text-sm text-slate-500">

              {percent} %

            </div>

          </div>

        </div>

        <div className="text-3xl font-black text-slate-800">

          {value}

        </div>

      </div>

      <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">

        <div
          className={`${color} h-full rounded-full`}
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  );
}