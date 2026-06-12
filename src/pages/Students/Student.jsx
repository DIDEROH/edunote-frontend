import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import { 
  ArrowPathIcon, 
  DocumentTextIcon, 
  EllipsisVerticalIcon, 
  FunnelIcon, 
  InformationCircleIcon, 
  PhoneIcon 
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

function Student() {
  const [students, setStudents] = useState([]) // Renommé en pluriel pour la clarté
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState()
  const [search, setSearch] = useState("")
  const [isOpneModal, setIsOpenModal] = useState(false)
  const navigate = useNavigate()

  // Filters & Options
  const [filters, setFilters] = useState({ classroom_id: '', academic_year_id: '', sex: '', school_id: '' })
  const [classrooms, setClassrooms] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [schools, setSchools] = useState([])

  // Renouvellement
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [renewalData, setRenewalData] = useState({ school_id: '', classroom_id: '' })

  const fetchFilterOptions = async () => {
    try {
      const [classRes, yearRes, schoolRes] = await Promise.all([
        axiosClient.get('/classrooms'),
        axiosClient.get('/academic-years'),
        axiosClient.get('/schools')
      ])
      setClassrooms(classRes.data)
      setAcademicYears(yearRes.data.data)
      setSchools(schoolRes.data)
    } catch (err) {
      toast.error("Impossible de charger les filtres")
    }
  }

  const fetchStudents = (page = 1, searchValue = search) => {
    setLoading(true)
    axiosClient.post('/enrollments/filter', { ...filters, search: searchValue, page })
      .then(({ data }) => {
        setStudents(data.data)
        setCurrentPage(data.current_page)
        setLastPage(data.last_page)
      })
      .catch((error) => {
        setErrors(error?.response?.data?.message || error?.message)
        toast.error("Erreur lors du chargement")
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
  const handleRenewalChange = (e) => setRenewalData({ ...renewalData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!renewalData.school_id || !renewalData.classroom_id) return toast.warning("Veuillez remplir tous les champs")

    axiosClient.post('/student-ren', {
      student_id: selectedStudentId,
      ...renewalData,
      withLoading: true
    })
    .then(({ data }) => {
      toast.success(data.message || "Inscription renouvelée")
      handleCloseModal()
      setRenewalData({ school_id: '', classroom_id: '' })
      fetchStudents(currentPage)
    })
    .catch(() => toast.error("Erreur lors du renouvellement"))
  }

  return (
    <main>
      <Navbar col={true}>
        <Navbar.Left><AddBtn action={() => navigate('/edunote/add-student')} /></Navbar.Left>
        <Navbar.Center>
          <div className="flex gap-2 items-center">
            <SelectComponent size='xs' name="classroom_id" value={filters.classroom_id} action={handleFilterChange}>
              <option value="">Toutes les classes</option>
              {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectComponent>

            <SelectComponent size='xs' name="academic_year_id" value={filters.academic_year_id} action={handleFilterChange}>
              <option value="">Toutes les années</option>
              {academicYears?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </SelectComponent>

            <SelectComponent size='xs' name="sex" value={filters.sex} action={handleFilterChange}>
              <option value="">Tous les sexes</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </SelectComponent>

            <SelectComponent size='xs' name="school_id" value={filters.school_id} action={handleFilterChange}>
              <option value="">Toutes les écoles</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </SelectComponent>

            <BtnGoshtComponent action={applyFilters}><FunnelIcon className="icone" /></BtnGoshtComponent>
          </div>
        </Navbar.Center>
        <Navbar.Right><SearchBar action={searchStudent} /></Navbar.Right>
      </Navbar>

      {loading ? <LoadingSkeletoon /> : (
        <section className="mt-5">
          {students.length !== 0 ? (
            <Table>
              <Table.Head>
                  <th>#</th>
                  <th>Noms et Prénoms</th>
                  <th>Sexe</th>
                  <th>Matricule</th>
                  <th>Classe Actuelle</th>
                  <th>École</th>
                  <th></th>
              </Table.Head>
              <Table.Body>
                {students.map((s, index) => {
                  const currentEnrol = s.enrollments?.[0]; // L'inscription la plus récente
                  return (
                    <TrComponent key={s.id}>
                      <TdComponent>{index + 1}</TdComponent>
                      <TdComponent>{s.first_name} {s.last_name}</TdComponent>
                      <TdComponent>{s.gender}</TdComponent>
                      <TdComponent>{s.matricule}</TdComponent>
                      <TdComponent>{currentEnrol?.classroom?.name || <span className="text-gray-400">Non inscrit</span>}</TdComponent>
                      <TdComponent>{currentEnrol?.school?.name || "-"}</TdComponent>
                      <TdComponent>
                        <DropdownComponent>
                          <DropdownComponent.Icon><EllipsisVerticalIcon className="icone" /></DropdownComponent.Icon>
                          <DropdownComponent.Items>
                            <li><NavLink to={`/edunote/student-informations/${s.id}`}><InformationCircleIcon className="icone" /> Informations</NavLink></li>
                            <li><button onClick={() => { setSelectedStudentId(s.id); setIsOpenModal(true); }} className="flex items-center gap-2"><ArrowPathIcon className="icone" /> Inscrire à nouveau</button></li>
                            {s.contact && <li><a href={`tel:${s.contact}`}><PhoneIcon className="icone" /> Contacter</a></li>}
                            <li><NavLink to={`/edunote/bulletins/${s.id}`}><DocumentTextIcon className="icone" /> Bulletin</NavLink></li>
                          </DropdownComponent.Items>
                        </DropdownComponent>
                      </TdComponent>
                    </TrComponent>
                  )
                })}
              </Table.Body>
            </Table>
          ) : <AlertInfo msg={errors || "Aucun élève trouvé"} />}
        </section>
      )}

      <section className="flex items-center justify-center mt-5">
        <Paginate currentPage={currentPage} lastPage={lastPage} onPageChange={(page) => fetchStudents(page)} siblingCount={1} />
      </section>

      {isOpneModal && (
        <ModalComponent>
          <ModalComponent.Title>Renouveler une inscription</ModalComponent.Title>
          <ModalComponent.Body>
            <form className="mb-4" onSubmit={handleSubmit}>
              <SelectComponent name="school_id" value={renewalData.school_id} action={handleRenewalChange}>
                <option value=''>-- Etablissement --</option>
                {schools?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </SelectComponent>
              <br /><br />
              <SelectComponent name="classroom_id" value={renewalData.classroom_id} action={handleRenewalChange}>
                <option value="">-- Classe --</option>
                {classrooms?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectComponent>
              <div className="mt-5 flex justify-end gap-3">
                <button type="button" className="btn btn-sm" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" className="btn btn-primary btn-sm">Soumettre</button>
              </div>
            </form>
          </ModalComponent.Body>
        </ModalComponent>
      )}
    </main>
  )
}

export default Student