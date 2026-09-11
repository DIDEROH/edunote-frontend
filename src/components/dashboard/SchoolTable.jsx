import { useMemo, useState } from "react";

import {
    FaSearch,
    FaSchool,
    FaMale,
    FaFemale,
    FaSortAmountDown,
} from "react-icons/fa";


export default function SchoolTable({ schools = [] }) {

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("total");

    const filteredSchools = useMemo(() => {
        let result = schools.filter((school) =>
            school.school_name.toLowerCase().includes(search.toLowerCase())
        );

        if (sort === "total") {
            result.sort((a, b) => b.total_students - a.total_students);
        }

        if (sort === "name") {
            result.sort((a, b) => a.school_name.localeCompare(b.school_name));
        }

        return result;
    }, [schools, search, sort]);


    return (
        <div className="rounded-md bg-base-200 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-base-content">Etablissements</h2>
                    <p className="text-xs text-base-content/60">Répartition des élèves par école</p>
                </div>

                <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3.5 py-2 text-primary text-sm">
                    <FaSchool size={13} />
                    <span className="font-semibold">{schools.length}</span>
                    écoles
                </div>
            </div>

            {/* Recherche */}
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
                    onClick={() => setSort(sort === "total" ? "name" : "total")}
                    className="flex items-center justify-center gap-2 rounded-md bg-base-100 px-4 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
                >
                    <FaSortAmountDown size={13} />
                    Trier
                </button>
            </div>

            {/* MOBILE CARDS */}
            <div className="flex overflow-x-auto gap-3 md:hidden">
                {filteredSchools.map((school) => (
                    <SchoolCard key={school.school_name} school={school} />
                ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-base-content/50">
                            <th className="p-3 font-medium">Ecole</th>
                            <th className="font-medium">Total</th>
                            <th className="font-medium">Garçons</th>
                            <th className="font-medium">Filles</th>
                            <th className="font-medium">Répartition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchools.map((school, i) => (
                            <tr key={school.school_name} className={`transition-colors duration-150 hover:bg-base-300 ${i % 2 === 1 ? 'bg-zebra' : ''}`}>
                                <td className="p-3 font-medium text-base-content">{school.school_name}</td>
                                <td>
                                    <span className="rounded-sm bg-primary/10 px-2.5 py-1 text-primary font-medium">
                                        {school.total_students}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-base-content/70">
                                        <FaMale className="text-base-content/40" size={13} />
                                        {school.boys}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-base-content/70">
                                        <FaFemale className="text-base-content/40" size={13} />
                                        {school.girls}
                                    </div>
                                </td>
                                <td>
                                    <Progress boys={school.boys} girls={school.girls} total={school.total_students} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function SchoolCard({ school }) {
    return (
        <div className="rounded-md bg-base-100 p-4 flex-none w-full max-w-72">
            <h3 className="font-medium text-sm text-base-content">{school.school_name}</h3>

            <div className="mt-3 flex justify-between text-sm text-base-content/70">
                <span>G: {school.boys}</span>
                <span>F: {school.girls}</span>
                <span className="font-semibold text-base-content">{school.total_students}</span>
            </div>

            <Progress boys={school.boys} girls={school.girls} total={school.total_students} />
        </div>
    );
}


function Progress({ boys, total }) {
    const boyPercent = total ? (boys / total) * 100 : 0;

    return (
        <div className="mt-2.5 h-1.5 rounded-sm bg-accent/25 overflow-hidden">
            <div style={{ width: `${boyPercent}%` }} className="h-full bg-primary" />
        </div>
    );
}
