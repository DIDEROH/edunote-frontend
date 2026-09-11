import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

import { FaChalkboardTeacher } from "react-icons/fa";


export default function TeacherChart({ data }) {

    const chartData =
        data?.map((item) => ({
            school: item.school_name,
            total: item.total,
            boys: item.boys,
            girls: item.girls,
        })) || [];


    return (
        <div className="rounded-md bg-base-200 p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-sm font-semibold text-base-content">
                        Répartition des enseignants
                    </h2>
                    <p className="text-xs text-base-content/60 mt-1">
                        Personnel enseignant par établissement
                    </p>
                </div>

                <div className="h-11 w-11 rounded-md bg-secondary/10 flex items-center justify-center">
                    <FaChalkboardTeacher className="text-lg text-secondary" />
                </div>
            </div>

            {/* Chart */}
            <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#E7E9F7" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: "#8A93A0" }} />
                        <YAxis type="category" dataKey="school" width={150} tick={{ fontSize: 12, fill: "#8A93A0" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        <Bar dataKey="total" name="Total" fill="#4F46E5" radius={[0, 3, 3, 0]} />
                        <Bar dataKey="boys" name="Hommes" fill="#0284C7" radius={[0, 3, 3, 0]} />
                        <Bar dataKey="girls" name="Femmes" fill="#DB2777" radius={[0, 3, 3, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}


function CustomTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const school = payload[0]?.payload;

    return (
        <div className="bg-base-200 rounded-md p-4">
            <h3 className="font-semibold text-sm text-base-content mb-2">
                {school.school}
            </h3>

            {payload.map((item) => (
                <div key={item.name} className="flex justify-between gap-8 py-0.5 text-sm">
                    <span className="text-base-content/60">{item.name}</span>
                    <strong className="text-base-content">{item.value}</strong>
                </div>
            ))}
        </div>
    );
}
