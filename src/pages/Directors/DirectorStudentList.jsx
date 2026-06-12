import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import { 
  ArrowPathIcon, 
  DocumentTextIcon, 
  EllipsisVerticalIcon, 
  FunnelIcon, 
  InformationCircleIcon, 
  PhoneIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline"

import axiosClient from "../../utils/AxiosClient"
import AddBtn from "../../components/AddBtn"
import Navbar from "../../components/Navbar"
import SearchBar from "../../components/SearchBar"
import Paginate from "../../components/Paginate"
import Table from "../../components/Table"
import SelectComponent from "../../components/SelectComponent"
import BtnGoshtComponent from "../../components/BtnGoshtComponent"
import DropdownComponent from "../../components/DropdownComponent"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"
import AlertInfo from "../../components/AlertInfo"
import ModalComponent from "../../components/ModalComponent"
import TdComponent from "../../components/TdComponent"
import TrComponent from "../../components/TrComponent"
import TitleComponent from "../../components/TitleComponent"

function DirectorStudentList() {
  const [students, setStudents] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState()
  const [search, setSearch] = useState("")
  const [isOpenModal, setIsOpenModal] = useState(false)
  const navigate = useNavigate()

  // Filters (Suppression du school_id car géré par le controller directeur)
  const [filters, setFilters] = useState({ classroom_id: '', academic_year_id: '', sex: '' })
  const [classrooms, setClassrooms] = useState([])
  const [academicYears, setAcademicYears] = useState([])

  // Renouvellement
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [renewalData, setRenewalData] = useState({ classroom_id: '' })

  const fetchFilterOptions = async () => {
    try {
      const [classRes, yearRes] = await Promise.all([
        axiosClient.get('/classrooms'),
        axiosClient.get('/academic-years')
      ])
      setClassrooms(classRes.data)
      setAcademicYears(yearRes.data.data)
    } catch (err) {
      toast.error("Erreur de chargement des filtres")
    }
  }

  const fetchStudents = (page = 1, searchValue = search) => {
    setLoading(true)
    // Utilisation de la route DÉDIÉE au directeur
    axiosClient.post('/director-space/students/filter', { ...filters, search: searchValue, page })
      .then(({ data }) => {
        setStudents(data.data)
        setCurrentPage(data.current_page)
        setLastPage(data.last_page)
      })
      .catch((error) => {
        setErrors("Erreur de connexion au serveur")
        toast.error("Impossible de charger vos élèves")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchFilterOptions()
    fetchStudents()
  }, [])

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const applyFilters = () => { setCurrentPage(1); fetchStudents(1); }
  const searchStudent = (value) => { setSearch(value); setCurrentPage(1); fetchStudents(1, value); }
  const handleCloseModal = () => setIsOpenModal(false)

  const handleRenewalSubmit = async (e) => {
    e.preventDefault()
    if (!renewalData.classroom_id) return toast.warning("Sélectionnez une classe")

    axiosClient.post('/director-space/students/renew', {
      student_id: selectedStudentId,
      ...renewalData
    })
    .then(({ data }) => {
      toast.success("Réinscription réussie")
      handleCloseModal()
      fetchStudents(currentPage)
    })
    .catch(() => toast.error("Erreur lors de la réinscription"))
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar col={true}>
        <Navbar.Left>
            <div className="flex items-center gap-4">
                <TitleComponent>Mes Élèves</TitleComponent>
                <AddBtn action={() => navigate('/edunote/directors/add-student')} />
            </div>
        </Navbar.Left>
        <Navbar.Center>
          <div className="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            <SelectComponent size='xs' name="classroom_id" value={filters.classroom_id} action={handleFilterChange}>
              <option value="">Classes</option>
              {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectComponent>

            <SelectComponent size='xs' name="academic_year_id" value={filters.academic_year_id} action={handleFilterChange}>
              <option value="">Années</option>
              {academicYears?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </SelectComponent>

            <SelectComponent size='xs' name="sex" value={filters.sex} action={handleFilterChange}>
              <option value="">Sexe</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </SelectComponent>

            <BtnGoshtComponent action={applyFilters}>
                <FunnelIcon className="w-4 h-4 text-indigo-600" />
            </BtnGoshtComponent>
          </div>
        </Navbar.Center>
        <Navbar.Right><SearchBar action={searchStudent} /></Navbar.Right>
      </Navbar>

      {loading ? <LoadingSkeletoon /> : (
        <section className="mt-8 px-4 lg:px-12">
          {students.length !== 0 ? (
            <div className="bg-white rounded-xl shadow-xl shadow-slate-200/60 border border-slate-100">
                <Table>
                <Table.Head>
                    <th className="p-5">#</th>
                    <th>Élève</th>
                    <th>Sexe</th>
                    <th>Matricule</th>
                    <th>Classe Actuelle</th>
                    <th className="text-right">Actions</th>
                </Table.Head>
                <Table.Body>
                    {students.map((s, index) => {
                    const currentEnrol = s.enrollments?.[0];
                    return (
                        <TrComponent key={s.id} className="group hover:bg-slate-50 transition-colors">
                        <TdComponent className="pl-6 text-slate-400 font-mono text-xs">{index + 1}</TdComponent>
                        <TdComponent>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black">
                                    {s.first_name[0]}{s.last_name[0]}
                                </div>
                                <span className="font-bold text-slate-700">{s.first_name} {s.last_name}</span>
                            </div>
                        </TdComponent>
                        <TdComponent>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${s.gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                {s.gender}
                            </span>
                        </TdComponent>
                        <TdComponent><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{s.matricule}</span></TdComponent>
                        <TdComponent>
                            <div className="flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4 text-slate-300" />
                                <span className="font-semibold text-slate-600">{currentEnrol?.classroom?.name || "Non inscrit"}</span>
                            </div>
                        </TdComponent>
                        <TdComponent className="text-right pr-6">
                            <DropdownComponent>
                            <DropdownComponent.Icon><EllipsisVerticalIcon className="w-5 h-5 text-slate-400" /></DropdownComponent.Icon>
                            <DropdownComponent.Items>
                                <li><NavLink to={`/edunote/student-informations/${s.id}`}><InformationCircleIcon className="w-4 h-4" /> Détails</NavLink></li>
                                <li><button onClick={() => { setSelectedStudentId(s.id); setIsOpenModal(true); }} className="flex items-center gap-2 text-indigo-600 font-bold"><ArrowPathIcon className="w-4 h-4" /> Réinscrire</button></li>
                                {s.contact && <li><a href={`tel:${s.contact}`}><PhoneIcon className="w-4 h-4" /> Appeler parent</a></li>}
                                <div className="border-t border-slate-50 my-1"></div>
                                <li><NavLink to={`/edunote/bulletins/${s.id}`}><DocumentTextIcon className="w-4 h-4 text-orange-500" /> Bulletin</NavLink></li>
                            </DropdownComponent.Items>
                            </DropdownComponent>
                        </TdComponent>
                        </TrComponent>
                    )
                    })}
                </Table.Body>
                </Table>
            </div>
          ) : <AlertInfo msg={errors || "Aucun élève trouvé dans votre établissement"} />}
        </section>
      )}

      <section className="flex items-center justify-center mt-8 pb-10">
        <Paginate currentPage={currentPage} lastPage={lastPage} onPageChange={(page) => fetchStudents(page)} siblingCount={1} />
      </section>

      {isOpenModal && (
        <ModalComponent>
          <ModalComponent.Title>Réinscription Année Active</ModalComponent.Title>
          <ModalComponent.Body>
            <form onSubmit={handleRenewalSubmit} className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-2xl text-[11px] text-indigo-700 font-bold flex gap-3">
                  <InformationCircleIcon className="w-5 h-5" />
                  L'élève sera automatiquement inscrit dans votre établissement pour l'année scolaire en cours.
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Choisir la nouvelle classe</label>
                <SelectComponent name="classroom_id" value={renewalData.classroom_id} action={(e) => setRenewalData({classroom_id: e.target.value})}>
                    <option value="">-- Sélectionner la classe --</option>
                    {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </SelectComponent>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-6 py-2 text-xs font-bold text-slate-400 hover:text-slate-600" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest">Confirmer</button>
              </div>
            </form>
          </ModalComponent.Body>
        </ModalComponent>
      )}
    </main>
  )
}

export default DirectorStudentList