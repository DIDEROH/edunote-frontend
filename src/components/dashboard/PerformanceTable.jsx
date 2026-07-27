import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
    FaSearch,
    FaTrophy,
    FaChartLine,
} from "react-icons/fa";


export default function PerformanceTable({ performances = [] }) {

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("rate");

    const filteredData = useMemo(() => {
        let result = performances.filter(item =>
            item.nom_ecole.toLowerCase().includes(search.toLowerCase())
        );

        if (sort === "rate") {
            result.sort((a, b) => b.admis.taux - a.admis.taux);
        }

        if (sort === "name") {
            result.sort((a, b) => a.nom_ecole.localeCompare(b.nom_ecole));
        }

        return result;
    }, [performances, search, sort]);


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6"
        >
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Performance scolaire</h2>
                    <p className="text-slate-500">Résultats par établissement</p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-3 text-yellow-700">
                    <FaTrophy />
                    <span className="font-bold">{performances.length}</span>
                    écoles
                </div>
            </div>

            {/* FILTRES */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une école..."
                        className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    onClick={() => setSort(sort === "rate" ? "name" : "rate")}
                    className="rounded-xl bg-slate-100 px-5 py-3 font-semibold"
                >
                    Trier
                </button>
            </div>

            {/* MOBILE */}
            <div className="md:hidden flex overflow-x-auto gap-4">
                {filteredData.map((item) => (
                    <PerformanceCard key={item.nom_ecole} item={item} />
                ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b text-sm text-slate-400">
                            <th className="p-4 text-left">Ecole</th>
                            <th>Inscrits</th>
                            <th>Admis</th>
                            <th>Echecs</th>
                            <th>Réussite</th>
                            <th>Niveau</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.nom_ecole} className="border-b hover:bg-slate-50">
                                <td className="p-4 font-semibold">{item.nom_ecole}</td>
                                <td>{item.inscrits.total}</td>
                                <td>
                                    <span className="text-green-600 font-bold">{item.admis.total}</span>
                                </td>
                                <td>
                                    <span className="text-red-500 font-bold">{item.echecs.total}</span>
                                </td>
                                <td>
                                    <ProgressRate value={item.admis.taux} />
                                </td>
                                <td>
                                    <PerformanceBadge value={item.admis.taux} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

}

function PerformanceCard({ item }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-5 flex-none w-full max-w-100">
            <h3 className="font-bold text-slate-800">{item.nom_ecole}</h3>

            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div>
                    <p className="text-xs text-slate-400">Inscrits</p>
                    <strong>{item.inscrits.total}</strong>
                </div>
                <div className="text-green-600">
                    <p className="text-xs">Admis</p>
                    <strong>{item.admis.total}</strong>
                </div>
                <div className="text-red-500">
                    <p className="text-xs">Echecs</p>
                    <strong>{item.echecs.total}</strong>
                </div>
            </div>

            <div className="mt-4">
                <ProgressRate value={item.admis.taux} />
            </div>

            <div className="mt-4">
                <PerformanceBadge value={item.admis.taux} />
            </div>
        </div>
    );
}

function ProgressRate({ value }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-2">
                <span>Réussite</span>
                <strong>{value}%</strong>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div style={{ width: `${value}%` }} className="h-full bg-green-500 rounded-full" />
            </div>
        </div>
    );
}

function PerformanceBadge({ value }) {
    let label = "Critique";
    let style = "bg-red-100 text-red-700";

    if (value >= 80) {
        label = "Excellent";
        style = "bg-green-100 text-green-700";
    } else if (value >= 50) {
        label = "Moyen";
        style = "bg-yellow-100 text-yellow-700";
    }

    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${style}`}>
            <FaChartLine />
            {label}
        </span>
    );
}