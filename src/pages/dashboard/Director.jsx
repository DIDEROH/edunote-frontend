import { useEffect, useState } from "react"
import { api } from "../../utils/AxiosClient"
import { toast } from "sonner";
import DirectorHeader from "../../components/dashboard/DirectorHeader";
import StatCard from "../../components/dashboard/StatCard";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import StudentPieChart from "../../components/dashboard/StudentPieChart";
import { ClassroomCards } from "../../components/ui/CardsComponents";
import PerformanceWidget from "../../components/dashboard/PerformanceWidget";

function Director() {
  const [dashboard, setDashboard] = useState();

  useEffect(() => {
    api.get('/statistics/director/dashboard')
    .then((response) => {
      console.log(response.data)
      setDashboard(response.data)
    })
    .catch((error) => {toast.error(error.message)})
  }, [])

  
  return (
    <main className="space-y-8">
      <DirectorHeader school={dashboard?.general?.school_info} user={dashboard?.general?.director} />


      

      {/* Performances de reussite des eleves de classe */}
      <section>
        <PerformanceWidget performance={dashboard?.performance} />
      </section>

      {/* KPI */}
      <section className="p-3 flex overflow-x-auto snap-x snap-mandatory pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 scrollbar-none">

          <StatCard
              title="Elèves"
              value={dashboard?.general?.students?.total}
              subtitle={`${dashboard?.general?.students?.boys} Garçons • ${dashboard?.general?.students?.girls} Filles`}
              icon={FaUserGraduate}
              color="blue"
          />

          <StatCard
              title="Enseignants"
              value={dashboard?.general?.teachers?.total}
              subtitle={`${dashboard?.general?.teachers?.boys} Hommes • ${dashboard?.general?.teachers?.girls} Femmes`}
              icon={FaChalkboardTeacher}
              color="blue"
          />

          <StatCard
              title="Salles de classe"
              value={dashboard?.general?.classrooms}
              subtitle='nombre de salles de classes'
              icon={FaChalkboardTeacher}
              color="blue"
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

          <StudentPieChart title="Répartition des enseignants" data={dashboard?.general?.teachers} />

      </section>

      {/* Nombre d'eleves par salles de classe'  */}
      <section className="mb-8">
        <ClassroomCards classrooms={dashboard?.general?.students_by_classroom} />
      </section>
    
    </main>
  )
}

export default Director