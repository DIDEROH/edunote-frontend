import { useEffect, useState } from "react"
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  HomeModernIcon, 
  LockClosedIcon,
  LockOpenIcon,
  ChartBarIcon 
} from "@heroicons/react/24/outline"
import axiosClient from "../../utils/AxiosClient"
import Navbar from "../../components/Navbar"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"

function DirectorDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosClient.get("/director-space/stats")
        setStats(data.data)
      } catch (error) {
        console.error("Erreur stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading || !stats) return <LoadingSkeletoon />

  // Maintenant stats est garanti d'être non-null ici
  const { school_info, counters, governance } = stats

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar>
        <Navbar.Left>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-lg">
              <HomeModernIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-sm text-indigo-900 uppercase tracking-tighter">
                {school_info.name}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Session {school_info.active_year}
              </p>
            </div>
          </div>
        </Navbar.Left>
        <Navbar.Right>
          <span className="badge badge-ghost font-bold text-[10px] uppercase p-3 border-slate-200">
            ID: {school_info.matricule}
          </span>
        </Navbar.Right>
      </Navbar>

      <section className="p-6 max-w-7xl mx-auto">
        {/* --- Grille des compteurs principaux --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Élèves */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Élèves inscrits</p>
              <h2 className="text-3xl font-black text-slate-900">{counters.students.total}</h2>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] font-bold text-blue-500">M: {counters.students.male}</span>
                <span className="text-[10px] font-bold text-pink-500">F: {counters.students.female}</span>
              </div>
            </div>
          </div>

          {/* Enseignants */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corps Enseignant</p>
              <h2 className="text-3xl font-black text-slate-900">{counters.staff.teachers}</h2>
              <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase">Personnel actif</p>
            </div>
          </div>

          {/* Classes */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <ChartBarIcon className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salles de classe</p>
              <h2 className="text-3xl font-black text-slate-900">{counters.pedagogy.classrooms}</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Espaces pédagogiques</p>
            </div>
          </div>
        </div>

 
        {/* Section Répartition par classe */}
        <div className="my-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="font-black text-xs uppercase tracking-[3px] text-slate-400 mb-8 flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4" /> Effectifs détaillés par salle
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.distribution.map((item, idx) => (
                <div key={idx} className="bg-slate-50/50 border border-slate-100 p-5 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                    <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 shadow-sm uppercase tracking-wider">
                        {item.classroom_name}
                    </span>
                    <span className="text-2xl font-black text-slate-900 group-hover:scale-110 transition-transform">
                        {item.total}
                    </span>
                    </div>

                    <div className="space-y-3">
                    {/* Barre Garçons */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-blue-500">
                        <span>Garçons</span>
                        <span>{item.male_count}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${(item.male_count / item.total) * 100}%` }}
                        ></div>
                        </div>
                    </div>

                    {/* Barre Filles */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-pink-500">
                        <span>Filles</span>
                        <span>{item.female_count}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-pink-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${(item.female_count / item.total) * 100}%` }}
                        ></div>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>

        {/* --- Gouvernance & Verrouillage --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xs uppercase tracking-[3px] text-slate-400 flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4" /> État de saisie des notes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {governance.term_statuses.map((status, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  status.is_locked 
                  ? 'bg-slate-50 border-slate-100 grayscale' 
                  : 'bg-green-50 border-green-100 border-2'
                }`}
              >
                {status.is_locked ? (
                  <LockClosedIcon className="w-6 h-6 text-slate-400 mb-2" />
                ) : (
                  <LockOpenIcon className="w-6 h-6 text-green-500 mb-2" />
                )}
                <span className="font-black text-[10px] uppercase text-slate-600 mb-1">Trimestre {status.term_id}</span>
                <span className={`text-[9px] font-bold uppercase ${status.is_locked ? 'text-slate-400' : 'text-green-600'}`}>
                  {status.is_locked ? 'Saisie verrouillée' : 'Saisie Ouverte'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default DirectorDashboard