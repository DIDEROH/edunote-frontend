import { useEffect, useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import BackComponent from "../../components/BackComponent"
import Navbar from "../../components/Navbar"
import axiosClient from "../../utils/AxiosClient"
import SelectComponent from "../../components/SelectComponent"
import BulletinOfficial from "../../components/BulletinOfficial"
import { useParams } from "react-router-dom"
import { PrinterIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"

function StudentReportCard() {
  const [terms, setTerms] = useState([])
  const [years, setYears] = useState([])
  const [selectedTerm, setSelectedTerm] = useState("1")
  const [selectedYear, setSelectedYear] = useState("")
  const [reportCard, setReportCard] = useState(null)
  const [loading, setLoading] = useState(false)

  const { id } = useParams()
  const bulletinRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: bulletinRef,
    documentTitle: `Bulletin_Eleve_${id}_T${selectedTerm}_${selectedYear}`,
    pageStyle: `
      @page {
        size: auto;
        margin: 8mm 5mm; 
      }
      @media print {
        body { 
          margin: 0; 
          -webkit-print-color-adjust: exact;
        }
        .no-print { display: none !important; }
      }
    `,
  })

  /** * Récupération du bulletin avec reset de l'état pour l'UX
   */
  const fetchReportCard = async (term, year) => {
    if (!term || !year) return
    try {
      setLoading(true)
      setReportCard(null) // On vide pour éviter le flash du mauvais message
      
      const { data } = await axiosClient.get(`/reports/student/${id}/${term}/${year}`)
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
    fetchReportCard(termValue, selectedYear)
  }

  const handleYearChange = (e) => {
    const yearValue = e.target.value
    setSelectedYear(yearValue)
    fetchReportCard(selectedTerm, yearValue)
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
        fetchReportCard(selectedTerm, currentYear)
      }
    } catch (error) {
      console.error("Erreur filtres:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataFilters()
  }, [id])

  return (
    <main className="text-xs">
      <Navbar>
        <Navbar.Left>
          <h1 className="font-black text-sm text-indigo-700 uppercase tracking-tighter">
            Bulletin de l'élève
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
          {reportCard && (
            <button
              onClick={handlePrint}
              className="btn btn-ghost text-primary hover:btn-primary hover:text-primary-content btn-sm rounded-full font-black uppercase text-[10px]"
            >
              <PrinterIcon className="icone w-4 h-4" /> Imprimer
            </button>
          )}
          <BackComponent />
        </Navbar.Right>
      </Navbar>

      {loading ? (
        <LoadingSkeletoon />
      ) : (
        <section className="p-4">
          {reportCard ? (
            <div className="flex justify-center">
               <div ref={bulletinRef} className="w-full">
                <BulletinOfficial bulletin={reportCard} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="bg-blue-50 p-6 rounded-full mb-4">
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-indigo-300" />
              </div>
              <h3 className="text-slate-800 font-black uppercase text-sm tracking-widest">
                {(!selectedTerm || !selectedYear) 
                  ? "Sélection requise" 
                  : "Aucun résultat trouvé"}
              </h3>
              <p className="text-slate-400 mt-2 max-w-xs mx-auto font-medium">
                {(!selectedTerm || !selectedYear) 
                  ? "Veuillez choisir une année et un trimestre pour afficher le bulletin." 
                  : "L'élève n'a aucune note enregistrée pour cette période spécifique."}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default StudentReportCard