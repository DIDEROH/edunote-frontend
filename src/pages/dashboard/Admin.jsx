import { useEffect, useState } from "react";
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


function Admin() {
    const [dashboard, setDashboard] = useState({});

    useEffect(() => {
      api.get('/statistics/admin/dashboard')
      .then((response) => {
        console.log(response.data)
        setDashboard(response.data)
      })
      .catch((error) => {toast.error(error.message)})
    }, [])

    // Plus tard ces données viendront de ton API

    return (
        <div className="min-h-screen">

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