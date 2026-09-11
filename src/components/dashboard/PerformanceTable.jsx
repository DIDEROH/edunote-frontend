import { useMemo, useState } from "react";

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
        <div className="rounded-md bg-base-200 p-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-base-content">Performance scolaire</h2>
                    <p className="text-xs text-base-content/60">Résultats par établissement</p>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3.5 py-2 text-warning text-sm">
                    <FaTrophy size={13} />
                    <span className="font-semibold">{performances.length}</span>
                    écoles
                </div>
            </div>

            {/* FILTRES */}
            <div className="flex flex-col md:flex-row gap-2.5 mb-5">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={13} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une école..."
                        className="w-full rounded-md bg-base-100 py-2.5 pl-10 pr-4 text-sm outline-none"
                    />
                </div>

                <button
                    onClick={() => setSort(sort === "rate" ? "name" : "rate")}
                    className="rounded-md bg-base-100 px-4 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
                >
                    Trier
                </button>
            </div>

            {/* MOBILE */}
            <div className="md:hidden flex overflow-x-auto gap-3">
                {filteredData.map((item) => (
                    <PerformanceCard key={item.nom_ecole} item={item} />
                ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-base-content/50">
                            <th className="p-3 text-left font-medium">Ecole</th>
                            <th className="font-medium">Inscrits</th>
                            <th className="font-medium">Admis</th>
                            <th className="font-medium">Echecs</th>
                            <th className="font-medium">Réussite</th>
                            <th className="font-medium">Niveau</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, i) => (
                            <tr key={item.nom_ecole} className={`transition-colors duration-150 hover:bg-base-300 ${i % 2 === 1 ? 'bg-zebra' : ''}`}>
                                <td className="p-3 font-medium text-base-content">{item.nom_ecole}</td>
                                <td className="text-center text-base-content/70">{item.inscrits.total}</td>
                                <td className="text-center">
                                    <span className="text-success font-semibold">{item.admis.total}</span>
                                </td>
                                <td className="text-center">
                                    <span className="text-error font-semibold">{item.echecs.total}</span>
                                </td>
                                <td>
                                    <ProgressRate value={item.admis.taux} />
                                </td>
                                <td className="text-center">
                                    <PerformanceBadge value={item.admis.taux} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}

function PerformanceCard({ item }) {
    return (
        <div className="rounded-md bg-base-100 p-4 flex-none w-full max-w-90">
            <h3 className="font-medium text-sm text-base-content">{item.nom_ecole}</h3>

            <div className="grid grid-cols-3 gap-3 mt-3 text-center text-sm">
                <div>
                    <p className="text-xs text-base-content/50">Inscrits</p>
                    <strong className="text-base-content">{item.inscrits.total}</strong>
                </div>
                <div>
                    <p className="text-xs text-success/80">Admis</p>
                    <strong className="text-success">{item.admis.total}</strong>
                </div>
                <div>
                    <p className="text-xs text-error/80">Echecs</p>
                    <strong className="text-error">{item.echecs.total}</strong>
                </div>
            </div>

            <div className="mt-3">
                <ProgressRate value={item.admis.taux} />
            </div>

            <div className="mt-3">
                <PerformanceBadge value={item.admis.taux} />
            </div>
        </div>
    );
}

function ProgressRate({ value }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1.5 text-base-content/60">
                <span>Réussite</span>
                <strong className="text-base-content">{value}%</strong>
            </div>
            <div className="h-1.5 rounded-sm bg-base-300 overflow-hidden">
                <div style={{ width: `${value}%` }} className="h-full rounded-sm bg-success" />
            </div>
        </div>
    );
}

function PerformanceBadge({ value }) {
    let label = "Critique";
    let style = "bg-error/10 text-error";

    if (value >= 80) {
        label = "Excellent";
        style = "bg-success/10 text-success";
    } else if (value >= 50) {
        label = "Moyen";
        style = "bg-warning/10 text-warning";
    }

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium ${style}`}>
            <FaChartLine size={11} />
            {label}
        </span>
    );
}
