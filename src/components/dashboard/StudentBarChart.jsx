import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { motion } from "framer-motion";
import { FaSchool } from "react-icons/fa";

export default function StudentBarChart({ data }) {
  const chartData =
    data?.map((school) => ({
      school: school.school_name,
      total: school.total_students,
      boys: school.boys,
      girls: school.girls,
    })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-800">
            Répartition des élèves
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Effectif par établissement
          </p>

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">

          <FaSchool className="text-2xl text-indigo-600" />

        </div>

      </div>

      {/* Graph */}

      <div className="h-[380px]">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart
            data={chartData}
            barGap={8}
            barCategoryGap={18}
          >

            <defs>

              <linearGradient
                id="blueBar"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>

              <linearGradient
                id="violetBar"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>

              <linearGradient
                id="pinkBar"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F9A8D4" />
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="school"
              tick={{
                fontSize: 12,
              }}
              angle={-15}
              textAnchor="end"
              interval={0}
            />

            <YAxis />

            <Tooltip
              content={<CustomTooltip />}
            />

            <Legend />

            <Bar
              dataKey="total"
              name="Total"
              fill="url(#blueBar)"
              radius={[8, 8, 0, 0]}
            />

            <Bar
              dataKey="boys"
              name="Garçons"
              fill="url(#violetBar)"
              radius={[8, 8, 0, 0]}
            />

            <Bar
              dataKey="girls"
              name="Filles"
              fill="url(#pinkBar)"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </motion.div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">

      <h3 className="mb-3 font-bold text-slate-800">

        {label}

      </h3>

      {payload.map((item) => (

        <div
          key={item.name}
          className="flex items-center justify-between gap-6 py-1"
        >

          <span
            className="font-medium"
            style={{
              color: item.color,
            }}
          >
            {item.name}
          </span>

          <span className="font-bold">

            {item.value}

          </span>

        </div>

      ))}

    </div>
  );
}