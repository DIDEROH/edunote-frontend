import { motion } from "framer-motion";
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
    const success =
        data?.admis?.taux ?? 0;

    const failure =
        data?.echecs?.taux ?? 0;

    const chartData = [
        {
            name: "Réussite",
            value: success,
            fill: "#22C55E",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: .95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .45 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6"
        >
            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">
                        Performance
                    </h2>

                    <p className="text-slate-500">
                        Taux de réussite global
                    </p>

                </div>

                <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">

                    <FaChartLine className="text-2xl text-green-600"/>

                </div>

            </div>

            {/* Graph */}

            <div className="relative h-72">

                <ResponsiveContainer>

                    <RadialBarChart
                        data={chartData}
                        innerRadius="75%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                    >

                        <PolarAngleAxis
                            type="number"
                            domain={[0,100]}
                            tick={false}
                        />

                        <RadialBar
                            dataKey="value"
                            cornerRadius={15}
                        />

                    </RadialBarChart>

                </ResponsiveContainer>

                {/* Centre */}

                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">

                    <span className="text-5xl font-black text-slate-800">

                        {success}%

                    </span>

                    <span className="text-slate-500 mt-2">

                        Réussite

                    </span>

                </div>

            </div>

            {/* Stats */}

            <div className="grid grid-cols-2 gap-4 mt-8">

                <div className="rounded-2xl bg-green-50 p-5">

                    <div className="flex items-center gap-3">

                        <FaCheckCircle className="text-green-600"/>

                        <span className="font-semibold text-slate-700">

                            Réussite

                        </span>

                    </div>

                    <div className="mt-4 text-4xl font-black text-green-600">

                        {success}%

                    </div>

                </div>

                <div className="rounded-2xl bg-red-50 p-5">

                    <div className="flex items-center gap-3">

                        <FaTimesCircle className="text-red-600"/>

                        <span className="font-semibold text-slate-700">

                            Échecs

                        </span>

                    </div>

                    <div className="mt-4 text-4xl font-black text-red-600">

                        {failure}%

                    </div>

                </div>

            </div>

        </motion.div>
    );
}