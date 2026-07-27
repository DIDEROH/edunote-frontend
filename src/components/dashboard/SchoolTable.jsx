import { useMemo, useState } from "react";
import { motion } from "framer-motion";

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



    const filteredSchools = useMemo(()=>{

        let result = schools.filter((school)=>

            school.school_name
            .toLowerCase()
            .includes(search.toLowerCase())

        );


        if(sort==="total"){

            result.sort(
                (a,b)=>
                b.total_students-a.total_students
            );

        }


        if(sort==="name"){

            result.sort(
                (a,b)=>
                a.school_name.localeCompare(
                    b.school_name
                )
            );

        }


        return result;


    },[
        schools,
        search,
        sort
    ]);



    return (

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Etablissements</h2>
                    <p className="text-slate-500">Répartition des élèves par école</p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-indigo-100 px-4 py-3 text-indigo-700">
                    <FaSchool />
                    <span className="font-bold">{schools.length}</span>
                    écoles
                </div>
            </div>

            {/* Recherche */}
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
                    onClick={() => setSort(sort === "total" ? "name" : "total")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-700"
                >
                    <FaSortAmountDown />
                    Trier
                </button>
            </div>

            {/* MOBILE CARDS */}
            <div className="flex overflow-x-auto gap-4 md:hidden">
                {filteredSchools.map((school) => (
                    <SchoolCard key={school.school_name} school={school} />
                ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b text-slate-400 text-sm">
                            <th className="p-4">Ecole</th>
                            <th>Total</th>
                            <th>Garçons</th>
                            <th>Filles</th>
                            <th>Répartition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchools.map((school) => (
                            <tr key={school.school_name} className="border-b hover:bg-slate-50 transition">
                                <td className="p-4 font-semibold">{school.school_name}</td>
                                <td>
                                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 font-bold">
                                        {school.total_students}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <FaMale className="text-blue-500" />
                                        {school.boys}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <FaFemale className="text-pink-500" />
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
        </motion.div>


    );

}


function SchoolCard({ school }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-5 flex-none w-full max-w-80">
            <h3 className="font-bold text-slate-800">{school.school_name}</h3>

            <div className="mt-4 flex justify-between">
                <span>👨 {school.boys}</span>
                <span>👩 {school.girls}</span>
                <span className="font-bold">{school.total_students}</span>
            </div>

            <Progress boys={school.boys} girls={school.girls} total={school.total_students} />
        </div>
    );
}


function Progress({ boys, girls, total }) {
    const boyPercent = total ? (boys / total) * 100 : 0;

    return (
        <div className="mt-3 h-2 rounded-full bg-pink-400 overflow-hidden">
            <div style={{ width: `${boyPercent}%` }} className="h-full bg-blue-500" />
        </div>
    );
}
