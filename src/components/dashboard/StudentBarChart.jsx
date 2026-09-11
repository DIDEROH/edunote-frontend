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
    <div className="rounded-md bg-base-200 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-base-content">
            Répartition des élèves
          </h2>
          <p className="mt-1 text-xs text-base-content/60">
            Effectif par établissement
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10">
          <FaSchool className="text-lg text-primary" />
        </div>
      </div>

      {/* Graph */}
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={8} barCategoryGap={18}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E7E9F7" />

            <XAxis
              dataKey="school"
              tick={{ fontSize: 12, fill: "#8A93A0" }}
              angle={-15}
              textAnchor="end"
              interval={0}
            />

            <YAxis tick={{ fontSize: 12, fill: "#8A93A0" }} />

            <Tooltip content={<CustomTooltip />} />

            <Legend />

            <Bar dataKey="total" name="Total" fill="#4F46E5" radius={[3, 3, 0, 0]} />
            <Bar dataKey="boys" name="Garçons" fill="#0284C7" radius={[3, 3, 0, 0]} />
            <Bar dataKey="girls" name="Filles" fill="#DB2777" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md bg-base-200 p-4">
      <h3 className="mb-2 text-sm font-semibold text-base-content">
        {label}
      </h3>

      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-6 py-0.5 text-sm">
          <span style={{ color: item.color }}>{item.name}</span>
          <strong className="text-base-content">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
