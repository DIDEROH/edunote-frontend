import { useEffect, useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import BackComponent from "../../components/BackComponent"
import Navbar from "../../components/Navbar"
import axiosClient from "../../utils/AxiosClient"
import SelectComponent from "../../components/SelectComponent"
import BulletinOfficial from "../../components/BulletinOfficial"
import Paginate from "../../components/Paginate"
import { useParams } from "react-router-dom"
import { PrinterIcon } from "@heroicons/react/24/outline"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"

function ClassroomReportCards() {
  const [terms, setTerms] = useState([])
  const [years, setYears] = useState([])
  const [selectedTerm, setSelectedTerm] = useState("1")
  const [selectedYear, setSelectedYear] = useState("")
  
  const [reportCard, setReportCard] = useState(null)
  const [loading, setLoading] = useState(false)

  const { schoolId, id } = useParams() 
  const bulletinRef = useRef()

  const handlePrint = useReactToPrint({
    contentRef: bulletinRef,
    documentTitle: `Bulletin_Ecole${schoolId}_Classe${id}_T${selectedTerm}_${selectedYear}`,
    pageStyle: `
      @page { size: auto; margin: 8mm 5mm; }
      @media print {
        body { margin: 0; -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  });

  const fetchReportCard = async (term, year, page = 1) => {
    if (!term || !year || !schoolId || !id) return
    try {
      setLoading(true)
      // IMPORTANT : On reset les données précédentes pour éviter l'affichage du message "Aucun bulletin" par erreur
      setReportCard(null) 
      
      const url = `/reports/school/${schoolId}/classroom/${id}/${term}/${year}?page=${page}`;
      const { data } = await axiosClient.get(url)
      setReportCard(data)
    } catch (error) {
      console.error("Erreur API:", error)
      setReportCard(null)
    } finally {
      setLoading(false)
    }
  }

  const handleTermChange = (e) => {
    const termValue = e.target.value
    setSelectedTerm(termValue)
    fetchReportCard(termValue, selectedYear, 1)
  }

  const handleYearChange = (e) => {
    const yearValue = e.target.value
    setSelectedYear(yearValue)
    fetchReportCard(selectedTerm, yearValue, 1)
  }

  const handlePageChange = (pageNumber) => {
    fetchReportCard(selectedTerm, selectedYear, pageNumber)
    window.scrollTo(0, 0)
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
        fetchReportCard(selectedTerm, currentYear, 1)
      }
    } catch (error) {
      console.error("Erreur chargement filtres:", error)
      setLoading(false)
    }
    // Note: setLoading(false) est géré dans fetchReportCard si yearsData existe
  }

  useEffect(() => {
    fetchDataFilters()
  }, [schoolId, id])

  return (
    <main className="text-xs">
      <Navbar>
        <Navbar.Left>
          <h1 className="font-bold text-sm text-indigo-700 uppercase tracking-tighter">
            Bulletins de la classe
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
              className="btn btn-ghost text-primary hover:btn-primary hover:text-primary-content btn-sm rounded-full font-black uppercase text-[10px]"
            >
              <PrinterIcon className="icone w-4 h-4" /> Imprimer
            </button>
          )}
          <BackComponent />
        </Navbar.Right>
      </Navbar>

      {/* PRIORITÉ 1 : Skeleton pendant le chargement */}
      {loading ? (
        <LoadingSkeletoon />
      ) : (
        <section className="p-4">
          {/* PRIORITÉ 2 : Affichage des données si elles existent */}
          {reportCard?.data?.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5" ref={bulletinRef}>
                {reportCard.data.map((bulletin, index) => (
                  <div key={index} className="break-after-page w-full">
                    <BulletinOfficial bulletin={bulletin} />
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-10 mb-20 no-print">
                <Paginate 
                  currentPage={reportCard.current_page}
                  lastPage={reportCard.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          ) : (
            /* PRIORITÉ 3 : Message d'absence de données uniquement hors chargement */
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                <PrinterIcon className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-slate-800 font-black uppercase text-sm tracking-widest">
                {(!selectedTerm || !selectedYear) 
                  ? "Sélectionnez les filtres" 
                  : "Aucun bulletin disponible"}
              </h3>
              <p className="text-slate-400 mt-2 max-w-xs mx-auto font-medium">
                {(!selectedTerm || !selectedYear) 
                  ? "Veuillez choisir une année scolaire et un trimestre pour générer les rapports." 
                  : "Aucune donnée d'évaluation n'a été trouvée pour cette classe sur la période sélectionnée."}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default ClassroomReportCards