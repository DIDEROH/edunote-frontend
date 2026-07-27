import { useSearchParams, useOutletContext } from "react-router-dom";
import PageHeader from "../../components/elements/PageHeader";
import { api } from "../../utils/AxiosClient";
import { useEffect, useState, useCallback, useRef } from "react";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import Paginate from "../../components/Paginate";
import { useReactToPrint } from "react-to-print";
import BulletinOfficial from "../../components/BulletinOfficial";

function Visualiser() {
    const [searchParams] = useSearchParams();
    
    // Récupération des paramètres
    const scope = searchParams.get("scope");
    const schoolId = searchParams.get("school_id");
    const classroomId = searchParams.get("classroom_id");
    const studentId = searchParams.get("student_id");
    const term = searchParams.get("term");

    // États
    const [loading, setLoading] = useState(true);
    const [bulletinsData, setBulletinsData] = useState(null);
    const [schoolName, setSchoolName] = useState("");
    const [termName, setTermName] = useState("");
    const bulletinRef = useRef(null);
    const { setNavbarActions } = useOutletContext();

    const handlePrint = useReactToPrint({
        contentRef: bulletinRef,
        pageStyle: `
            @page { 
            size: A4; 
            margin: 0mm; /* Marges minimales pour maximiser l'espace */
            } 
            @media print { 
            body { 
                -webkit-print-color-adjust: exact; 
                margin: 0; /* Supprime les marges par défaut du navigateur */
                padding: 0;
            } 
            /* Empêche un bloc (ex: tableau, carte) de se couper en deux entre deux pages */
            .avoid-break {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            .break-after-page { 
                page-break-after: always; 
                break-after: page; 
                margin-top: 0; 
                padding-top: 0; 
            } 
            .bulletin-container { 
                display: block; 
                width: 100%; 
            } 
            }
        `,
    });




    // Fonction de récupération des bulletins (La clé de la pagination)
    const fetchBulletins = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.post("/reports/generate", {
                scope,
                school_id: schoolId,
                classroom_id: classroomId,
                student_id: studentId,
                term,
                page: page
            });
            setBulletinsData(response.data);
        } catch (error) {
            console.error("Erreur critique lors de la génération :", error);
        } finally {
            setLoading(false);
        }
    }, [scope, schoolId, classroomId, studentId, term]);

    // options en haut 
    useEffect(() => {
        setNavbarActions({
            onPrint: () => {handlePrint()},
        })

        return () => setNavbarActions({});
    }, [setNavbarActions])

    // Initialisation
    useEffect(() => {
        Promise.all([
            api.get(`/schools/${schoolId}`),
            api.get(`/terms/${term}`)
        ]).then(([sRes, tRes]) => {
            setSchoolName(sRes.data.name);
            setTermName(tRes.data.name);
            fetchBulletins(1); // Charge la page 1
        });
    }, [schoolId, term, fetchBulletins]);

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="Génération des Bulletins"
                subtitle={`${schoolName || ''} | ${termName || ''}`}
            />
            
            <div className="max-w-5xl mx-auto p-6">
                {loading ? (
                    <LoadingSkeleton />
                ) : bulletinsData ? (
                    <div className="space-y-6"> 
                        {/* Contenu des bulletins */}
                        <div className="bulletin-container bg-white" ref={bulletinRef}>
                            {bulletinsData.data.map((bulletin, index) => (
                                <div key={index} className="break-after-page w-full">
                                    <BulletinOfficial bulletin={bulletin} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-4">
                            <Paginate 
                                currentPage={bulletinsData.current_page} // 1. Utiliser la page courante renvoyée par Laravel
                                lastPage={bulletinsData.last_page} 
                                onPageChange={(page) => fetchBulletins(page)} // 2. Passer directement la nouvelle page cliquée
                                siblingCount={1} 
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default Visualiser;