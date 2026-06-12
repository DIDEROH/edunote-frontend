import { useEffect, useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { useParams } from "react-router-dom"
import { PrinterIcon, SparklesIcon } from "@heroicons/react/24/outline"
import axiosClient from "../../utils/AxiosClient"

// Components
import BackComponent from "../../components/BackComponent"
import Navbar from "../../components/Navbar"
import SelectComponent from "../../components/SelectComponent"
import BulletinOfficial from "../../components/BulletinOfficial"
import Paginate from "../../components/Paginate"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"

function DirectorClassroomReports() {
  const { id } = useParams();
  const bulletinRef = useRef();
  
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Nouvel état pour le premier chargement

  // 1. Impression optimisée pour le Directeur
  const handlePrint = useReactToPrint({
    contentRef: bulletinRef,
    documentTitle: `Bulletins_Classe_${id}_T${selectedTerm}`,
    pageStyle: `
      @page { size: auto; margin: 8mm 5mm; }
      @media print {
        body { margin: 0; -webkit-print-color-adjust: exact; background: white; }
        .no-print { display: none !important; }
      }
    `,
  });

  // 2. Fetch des bulletins (Route simplifiée pour le Directeur)
  const fetchReportCard = async (termId, page = 1) => {
    if (!termId || !id) return;
    
    setLoading(true);
    // On ne fait plus setReportCard(null) ici pour éviter le flash du message "vide"
    
    try {
      const url = `/director-space/reports/classroom/${id}/${termId}?page=${page}`;
      const { data } = await axiosClient.get(url);
      setReportCard(data);
    } catch (error) {
      console.error("Erreur API:", error);
      setReportCard({ data: [] }); // En cas d'erreur, on définit un tableau vide
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // 3. Chargement initial des trimestres
   useEffect(() => {
        const fetchInitialData = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get('/terms');
            const termsData = data.data ?? data;
            setTerms(termsData);
            
            if (termsData.length > 0) {
            const firstTermId = termsData[0].id;
            setSelectedTerm(firstTermId);
            fetchReportCard(firstTermId, 1);
            } else {
                setInitialLoad(false);
                setLoading(false);
            }
        } catch (error) {
            setInitialLoad(false);
            setLoading(false);
        }
        };
        fetchInitialData();
    }, [id]);

  const handleTermChange = (e) => {
    const termValue = e.target.value
    setSelectedTerm(termValue)
    fetchReportCard(termValue, 1)
  }

  const handlePageChange = (pageNumber) => {
    fetchReportCard(selectedTerm, pageNumber)
    window.scrollTo(0, 0)
  }

  return (
    <main className="text-xs bg-slate-50 min-h-screen">
      <Navbar>
        <Navbar.Left>
          <div className="flex flex-col">
            <h1 className="font-black text-[11px] text-indigo-700 uppercase tracking-[2px] flex items-center gap-2">
               <SparklesIcon className="w-4 h-4" /> Espace Direction
            </h1>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Génération des bulletins par classe</span>
          </div>
        </Navbar.Left>

        <Navbar.Center>
            <SelectComponent 
                name="term" 
                value={selectedTerm} 
                action={handleTermChange}
                className="!bg-slate-50 border-none !py-2 !text-[10px] min-w-[150px]"
            >
              <option value="">Sélectionner le trimestre</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>{t?.name}</option>
              ))}
            </SelectComponent>
        </Navbar.Center>

        <Navbar.Right className="flex gap-2">
          {reportCard?.data?.length > 0 && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <PrinterIcon className="w-4 h-4" /> Imprimer la classe
            </button>
          )}
          <BackComponent />
        </Navbar.Right>
      </Navbar>

      <section className="max-w-5xl mx-auto p-6">
        {/* CONDITION 1 : On affiche le Skeleton si on charge ET qu'on n'a pas encore de données ou si c'est le load initial */}
        {(loading || initialLoad) ? (
          <LoadingSkeletoon />
        ) : (
          <>
            {/* CONDITION 2 : On affiche les données si elles existent */}
            {reportCard?.data?.length > 0 ? (
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-8" ref={bulletinRef}>
                  {reportCard.data.map((bulletin, index) => (
                    <div key={index} className="break-after-page w-full shadow-sm">
                      <BulletinOfficial bulletin={bulletin} />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6 mb-20 no-print">
                  <Paginate 
                    currentPage={reportCard.current_page}
                    lastPage={reportCard.last_page}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            ) : (
              /* CONDITION 3 : L'état "Vide" n'apparaît QUE si loading est false ET qu'on a fini de chercher */
              <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[3rem] border border-dashed border-slate-200 text-center p-12">
                <div className="bg-indigo-50 p-8 rounded-full mb-6">
                  <PrinterIcon className="w-16 h-16 text-indigo-200" />
                </div>
                <h3 className="text-slate-800 font-black uppercase text-sm tracking-[3px]">
                   Aucun bulletin trouvé
                </h3>
                <p className="text-slate-400 mt-4 max-w-sm mx-auto font-bold text-[11px] uppercase tracking-wider leading-relaxed">
                  Les données d'évaluations ne sont pas encore disponibles pour ce trimestre dans votre école.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default DirectorClassroomReports;