import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    FaUserGraduate,
    FaSchool,
    FaChalkboardTeacher,
    FaUsers,
} from "react-icons/fa";
import Header from "../../components/dashboard/Header";
import StatCard from "../../components/dashboard/StatCard";
import StudentBarChart from "../../components/dashboard/StudentBarChart";
import StudentPieChart from "../../components/dashboard/StudentPieChart";
import TeacherChart from "../../components/dashboard/TeacherChart";
import PerformanceGauge from "../../components/dashboard/PerformanceGauge";
import SchoolTable from "../../components/dashboard/SchoolTable";
import PerformanceTable from "../../components/dashboard/PerformanceTable";
import { toast } from 'sonner'
import { api } from '../../utils/AxiosClient'
import usePrintable from "../../utils/usePrintable";
import PrintableTable from "../../components/print/PrintableTable";


function Admin() {
    const [dashboard, setDashboard] = useState({});
    const { setNavbarActions } = useOutletContext();
    const { printRef, print } = usePrintable("Statistiques generales");

    useEffect(() => {
      api.get('/statistics/admin/dashboard')
      .then((response) => {
        console.log(response.data)
        setDashboard(response.data)
      })
      .catch((error) => {toast.error(error.message)})
    }, [])

    useEffect(() => {
        setNavbarActions({ onPrint: print });
        return () => setNavbarActions({});
    }, [setNavbarActions, print]);

    // Fusion des statistiques par école (effectifs + performance) pour l'impression
    const printRows = useMemo(() => {
        const bySchool = dashboard?.general?.studentBySchool || [];
        const performance = dashboard?.performance?.by_school || [];

        return bySchool.map((s) => {
            const perf = performance.find((p) => p.nom_ecole === s.school_name);
            return {
                school: s.school_name,
                total: s.total_students,
                boys: s.boys,
                girls: s.girls,
                admis: perf?.admis?.total ?? "-",
                echecs: perf?.echecs?.total ?? "-",
                taux: perf?.admis?.taux != null ? `${perf.admis.taux}%` : "-",
            };
        });
    }, [dashboard]);

    // Plus tard ces données viendront de ton API

    return (
        <div className="min-h-screen">

            <PrintableTable
                ref={printRef}
                title="Statistiques generales - EDUNOTE"
                meta={[
                    { label: "Periode", value: dashboard?.period || "-" },
                    { label: "Ecoles", value: dashboard?.general?.schools ?? "-" },
                    { label: "Eleves", value: dashboard?.general?.students?.total ?? "-" },
                    { label: "Enseignants", value: dashboard?.general?.teachers ?? "-" },
                ]}
                columns={[
                    { key: "school", label: "Etablissement" },
                    { key: "total", label: "Effectif" },
                    { key: "boys", label: "Garcons" },
                    { key: "girls", label: "Filles" },
                    { key: "admis", label: "Admis" },
                    { key: "echecs", label: "Echecs" },
                    { key: "taux", label: "Taux reussite" },
                ]}
                rows={printRows}
            />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <Header user={dashboard?.general?.user} period={dashboard.period} />

                {/* KPI */}
                <section className="p-3 flex overflow-x-auto snap-x snap-mandatory pb-3 sm:grid sm:grid-cols-2 xl:grid-cols-4 gap-5 scrollbar-none">

                    <StatCard
                        title="Elèves"
                        value={dashboard?.general?.students?.total}
                        subtitle={`${dashboard?.general?.students?.boys} Garçons • ${dashboard?.general?.students?.girls} Filles`}
                        icon={FaUserGraduate}
                        color="blue"
                    />
                    <StatCard
                        title="Ecoles"
                        value={dashboard?.general?.schools}   
                        subtitle="Etablissements"
                        icon={FaSchool}
                        color="violet"
                    />
                    <StatCard
                        title="Enseignants"
                        value={dashboard?.general?.teachers}
                        subtitle="Personnel enseignant"
                        icon={FaChalkboardTeacher}
                        color="green"
                    />
                    <StatCard
                        title="Utilisateurs"
                        value={dashboard?.general?.users}
                        subtitle="Tous rôles"
                        icon={FaUsers}
                        color="orange"
                    />
                </section>

                {/* Deuxième ligne */}
                <section
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-6
                    "
                >

                    <StudentPieChart data={dashboard?.general?.students} />

                    <PerformanceGauge data={dashboard?.performance?.global} />

                </section>


                {/* Zone Graphiques */}
                <section>

                        <StudentBarChart data={dashboard?.general?.studentBySchool} />
                    {/* <UserCard user={dashboard?.general?.user} /> */}

                </section>

                {/* Troisième ligne */}
                <section>

                    <TeacherChart data={dashboard?.general?.teachersBySchool} />

                </section>

                {/* Quatrième ligne */}

                <SchoolTable schools={dashboard?.general?.studentBySchool} />

                {/* Cinquième ligne */}

                <PerformanceTable performances={dashboard?.performance?.by_school} />

            </div>

        </div>
    );

}

export default Admin