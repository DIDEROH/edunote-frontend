import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";

import {
    FaCheckCircle,
    FaTimesCircle,
    FaChartLine,
} from "react-icons/fa";

export default function PerformanceGauge({ data }) {
    const success = data?.admis?.taux ?? 0;
    const failure = data?.echecs?.taux ?? 0;

    const chartData = [
        {
            name: "Réussite",
            value: success,
            fill: "#059669",
        },
    ];

    return (
        <div className="rounded-md bg-base-200 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-semibold text-base-content">
                        Performance
                    </h2>
                    <p className="text-xs text-base-content/60">
                        Taux de réussite global
                    </p>
                </div>

                <div className="h-11 w-11 rounded-md bg-success/10 flex items-center justify-center">
                    <FaChartLine className="text-lg text-success" />
                </div>
            </div>

            {/* Graph */}
            <div className="relative h-64">
                <ResponsiveContainer>
                    <RadialBarChart
                        data={chartData}
                        innerRadius="75%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#E7E9F7" }} />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Centre */}
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                    <span className="text-2xl font-semibold text-base-content">
                        {success}%
                    </span>
                    <span className="text-xs text-base-content/60 mt-1">
                        Réussite
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-md bg-success/10 p-4">
                    <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-success" size={14} />
                        <span className="text-sm font-medium text-base-content">
                            Réussite
                        </span>
                    </div>

                    <div className="mt-3 text-xl font-semibold text-success">
                        {success}%
                    </div>
                </div>

                <div className="rounded-md bg-error/10 p-4">
                    <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-error" size={14} />
                        <span className="text-sm font-medium text-base-content">
                            Échecs
                        </span>
                    </div>

                    <div className="mt-3 text-xl font-semibold text-error">
                        {failure}%
                    </div>
                </div>
            </div>
        </div>
    );
}
