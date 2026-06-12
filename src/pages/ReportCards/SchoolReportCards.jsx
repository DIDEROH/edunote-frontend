import { useEffect, useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import BackComponent from "../../components/BackComponent"
import Navbar from "../../components/Navbar"
import axiosClient from "../../utils/AxiosClient"
import SelectComponent from "../../components/SelectComponent"
import BulletinOfficial from "../../components/BulletinOfficial"
import Paginate from "../../components/Paginate" // Import du composant
import { useParams } from "react-router-dom"
import { PrinterIcon } from "@heroicons/react/24/outline"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"

function SchoolReportCards() {
  const [terms, setTerms] = useState([])
  const [years, setYears] = useState([])
  const [selectedTerm, setSelectedTerm] = useState("1")
  const [selectedYear, setSelectedYear] = useState("")
  
  // reportCard reçoit maintenant l'objet paginé { data: [...], current_page: 1, last_page: 5 }
  const [reportCard, setReportCard] = useState(null)
  const [loading, setLoading] = useState(false)

  const { id } = useParams()
  const bulletinRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: bulletinRef,
    documentTitle: `Bulletin_Ecole_T${selectedTerm}_${selectedYear}`,
  })

  /**
   * Récupération des bulletins avec gestion de la page
   */
  const fetchReportCard = async (term, year, page = 1) => {
    if (!term || !year) return
    try {
      setLoading(true)
      const { data } = await axiosClient.get(`/reports/school/${id}/${term}/${year}?page=${page}`)
      setReportCard(data)
    } catch (error) {
      setReportCard(null)
      console.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTermChange = (e) => {
    const termValue = e.target.value
    setSelectedTerm(termValue)
    fetchReportCard(termValue, selectedYear, 1) // Reset à la page 1
  }

  const handleYearChange = (e) => {
    const yearValue = e.target.value
    setSelectedYear(yearValue)
    fetchReportCard(selectedTerm, yearValue, 1) // Reset à la page 1
  }

  const handlePageChange = (pageNumber) => {
    fetchReportCard(selectedTerm, selectedYear, pageNumber)
    window.scrollTo(0, 0) // Retour en haut lors du changement de page
  }

  const fetchDataFilters = async () => {
    try {
      setLoading(true)
      const [termsRes, yearsRes] = await Promise.all([
        axiosClient.get('/terms'),
        axiosClient.get('/academic-years')
      ])
      
      const termsData = termsRes.data.data ?? termsRes.data
      const yearsData = yearsRes.data.data ?? yearsRes.data
      
      setTerms(termsData)
      setYears(yearsData)
      
      if (yearsData.length > 0) {
        const currentYear = yearsData[0].id
        setSelectedYear(currentYear)
        fetchReportCard("1", currentYear, 1)
      }
    } catch (error) {
      console.error("Erreur chargement filtres:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataFilters()
  }, [])

  return (
    <main className="text-xs">
      <Navbar>
        <Navbar.Left>
          <h1 className="font-bold text-sm text-indigo-700">
            Bulletins de l'école
          </h1>
        </Navbar.Left>

        <Navbar.Center className="flex gap-2">
          <SelectComponent name="year" value={selectedYear} action={handleYearChange}>
            <option value="">-- Année --</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y?.name || y?.year}</option>
            ))}
          </SelectComponent>

          <SelectComponent name="term" value={selectedTerm} action={handleTermChange}>
            <option value="">-- Trimestre --</option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>{t?.name}</option>
            ))}
          </SelectComponent>
        </Navbar.Center>

        <Navbar.Right className="flex gap-2">
          {reportCard?.data?.length > 0 && (
            <button
              onClick={handlePrint}
              className="btn btn-ghost text-primary hover:btn-primary hover:text-primary-content btn-sm rounded-full"
            >
              <PrinterIcon className="icone w-4 h-4" /> Imprimer cette page
            </button>
          )}
          <BackComponent />
        </Navbar.Right>
      </Navbar>

      {loading ? (
        <LoadingSkeletoon />
      ) : (
        <section className="p-4">
          {reportCard?.data?.length > 0 ? (
            <div className="flex flex-col gap-8">
              {/* Conteneur pour l'impression */}
              <div className="flex flex-col gap-5" ref={bulletinRef}>
                {reportCard.data.map((bulletin, index) => (
                  <div 
                    key={index} 
                    className="break-after-page w-full" 
                    style={{ breakAfter: 'page' }} 
                  >
                    <BulletinOfficial bulletin={bulletin} />
                  </div>
                ))}
              </div>

              {/* Pagination (cachée à l'impression) */}
              <div className="flex justify-center mt-10 mb-20 no-print">
                <Paginate 
                  currentPage={reportCard.current_page}
                  lastPage={reportCard.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          ) : (
            <div className="text-center mt-10 text-gray-500">
              {(!selectedTerm || !selectedYear) 
                ? "Veuillez sélectionner une année et un trimestre." 
                : <span className="loading loading-ring loading-xl"></span>}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default SchoolReportCards