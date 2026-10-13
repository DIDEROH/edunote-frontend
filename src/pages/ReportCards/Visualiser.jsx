import { useSearchParams, useOutletContext } from "react-router-dom";
import PageHeader from "../../components/elements/PageHeader";
import { api } from "../../utils/AxiosClient";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle, FileX2, HardDrive, Loader2 } from "lucide-react";
import { prepareBulletins } from "../../utils/bulletinPreparation";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import Paginate from "../../components/Paginate";
import { useReactToPrint } from "react-to-print";
import BulletinOfficial from "../../components/BulletinOfficial";
import PrintSheet from "../../components/print/PrintSheet";
import { Card5 } from "../../components/ui/CardsComponents";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";

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
    const [cachedAt, setCachedAt] = useState(null);
    const bulletinRef = useRef(null);
    // Actualisation en cours (annulée si l'on change de page ou quitte l'aperçu)
    const refreshController = useRef(null);
    const { setNavbarActions } = useOutletContext();

    const handlePrint = useReactToPrint({
        contentRef: bulletinRef,
        // Marge @page à 0 : la marge de 0,7 cm est portée par PrintSheet sur chaque
        // page (même celles où un bulletin déborde), et le navigateur n'a pas de
        // place pour imprimer ses en-têtes et pieds de page (date, adresse).
        pageStyle: `
            @page {
            size: A4;
            margin: 0;
            }
            @media print {
            html, body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin: 0;
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
            /* Pas de page blanche après le dernier bulletin */
            .break-after-page:last-child {
                page-break-after: auto;
                break-after: auto;
            }
            .bulletin-container {
                display: block;
                width: 100%;
            }
            }
        `,
    });

    // Page courante de la pagination Laravel
    const [page, setPage] = useState(1);

    const changePage = useCallback((nextPage) => {
        refreshController.current?.abort();
        setLoading(true);
        setPage(nextPage);
    }, []);

    // options en haut
    useEffect(() => {
        setNavbarActions({
            onPrint: () => {handlePrint()},
        })

        return () => setNavbarActions({});
    }, [setNavbarActions, handlePrint])

    const selection = useMemo(() => ({
        scope,
        school_id: schoolId || undefined,
        classroom_id: classroomId || undefined,
        student_id: studentId || undefined,
        term,
    }), [scope, schoolId, classroomId, studentId, term]);

    // 1. Préparation côté serveur : les bulletins manquants sont calculés un
    // par un et mis en cache ; on suit la progression.
    const [prepared, setPrepared] = useState(false);
    const [progress, setProgress] = useState(null);
    const [round, setRound] = useState(0);
    const retried = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        prepareBulletins(selection, { onProgress: setProgress, signal: controller.signal })
            .catch((error) => {
                if (controller.signal.aborted) return;
                // Hors ligne : on affichera les bulletins enregistrés sur l'appareil
                if (!error.isNetworkError) toast.error(error.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setPrepared(true);
            });

        return () => controller.abort();
    }, [selection, round]);

    // 2. Lecture de la page, depuis le cache du serveur (aucun calcul)
    // 🐛 Le nom de l'école et du trimestre sont lus dans les bulletins (deux
    // appels séparés pouvaient bloquer la page en chargement).
    useEffect(() => {
        if (!prepared) return;
        let ignore = false;

        api.post("/reports/generate", { ...selection, page })
            .then((response) => {
                if (ignore) return;
                const data = response.data;

                // Des bulletins ont été invalidés entre-temps (note modifiée...) : nouvelle préparation, une fois
                if (data.missing > 0 && !response.fromCache && !retried.current) {
                    retried.current = true;
                    setPrepared(false);
                    setProgress(null);
                    setRound((value) => value + 1);
                    return;
                }

                setBulletinsData(data);
                // Hors ligne : bulletins servis depuis l'appareil (dernière consultation)
                setCachedAt(response.fromCache ? response.cachedAt : null);
                setLoading(false);
            })
            .catch((error) => {
                if (ignore) return;
                setBulletinsData(null);
                setLoading(false);
                toast.error(error.message || "Impossible d'afficher les bulletins.");
            });

        return () => { ignore = true; };
    }, [prepared, selection, page]);

    // 3. Actualiser : les bulletins invalidés depuis l'affichage (note, coefficient
    // modifiés...) sont recalculés par le serveur, puis la page courante est relue.
    // L'aperçu reste affiché pendant ce temps.
    useEffect(() => () => refreshController.current?.abort(), []);

    useNavbarRefresh(prepared ? async () => {
        refreshController.current?.abort();
        const controller = new AbortController();
        refreshController.current = controller;
        const { signal } = controller;

        try {
            try {
                await prepareBulletins(selection, { signal });
            } catch (error) {
                // Hors ligne : on relit les bulletins enregistrés sur l'appareil
                if (signal.aborted || !error.isNetworkError) throw error;
            }

            const response = await api.post("/reports/generate", { ...selection, page }, { signal });
            if (signal.aborted) return;
            setBulletinsData(response.data);
            setCachedAt(response.fromCache ? response.cachedAt : null);
        } catch (error) {
            // Annulée (page quittée ou changée) : rien à signaler
            if (!signal.aborted) throw error;
        }
    } : null);

    const firstBulletin = bulletinsData?.data?.[0];
    const subtitle = firstBulletin
        ? `${firstBulletin.school?.name || ""} | ${firstBulletin.term?.name || ""}`
        : "Aperçu avant impression";

    return (
        <div className="min-h-screen bg-base-100">
            <PageHeader
                title="Génération des Bulletins"
                subtitle={subtitle}
            />

            <div className="max-w-5xl mx-auto p-6">
                {cachedAt && (
                    <div className="mb-4 flex items-center gap-2 rounded-md bg-info/10 px-4 py-2.5 text-xs font-medium text-info">
                        <HardDrive size={14} />
                        Bulletins enregistrés sur l'appareil le {new Date(cachedAt).toLocaleString("fr-FR")}
                    </div>
                )}

                {!prepared ? (
                    <PreparationProgress progress={progress} />
                ) : loading ? (
                    <LoadingSkeleton />
                ) : bulletinsData?.data?.length ? (
                    <div className="space-y-6">
                        {bulletinsData.missing > 0 && (
                            <div className="flex items-center gap-2 rounded-md bg-warning/10 px-4 py-2.5 text-xs font-medium text-warning">
                                <AlertCircle size={14} />
                                {bulletinsData.missing} bulletin(s) de cette page n'ont pas pu être générés.
                            </div>
                        )}

                        {/* Contenu des bulletins */}
                        <div className="bulletin-container bg-white" ref={bulletinRef}>
                            {bulletinsData.data.map((bulletin, index) => (
                                <div key={index} className="break-after-page w-full">
                                    <PrintSheet>
                                        <BulletinOfficial bulletin={bulletin} />
                                    </PrintSheet>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center gap-4">
                            <Paginate
                                currentPage={bulletinsData.current_page} // 1. Utiliser la page courante renvoyée par Laravel
                                lastPage={bulletinsData.last_page}
                                onPageChange={changePage} // 2. Passer directement la nouvelle page cliquée
                                siblingCount={1}
                            />
                        </div>
                    </div>
                ) : (
                    <Card5 icon={FileX2}>Aucun bulletin à afficher pour cette sélection.</Card5>
                )}
            </div>
        </div>
    );
}

/**
 * Avancement de la préparation des bulletins (calculés un par un par le serveur).
 */
function PreparationProgress({ progress }) {
    const total = progress?.total || 0;
    const processed = progress?.processed || 0;
    const percent = progress?.progress_percent || 0;

    return (
        <div className="mx-auto max-w-xl rounded-md bg-base-200 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Loader2 size={22} className="animate-spin" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-base-content">Préparation des bulletins</h2>
            <p className="mt-1 text-sm text-base-content/60">
                {progress?.busy
                    ? "Le serveur termine une autre génération de bulletins, les vôtres suivent juste après."
                    : total > 0
                        ? `${processed} / ${total} bulletin(s) prêt(s)`
                        : "Démarrage..."}
            </p>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-sm bg-base-300">
                <div className="h-full rounded-sm bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-4 text-xs text-base-content/50">
                Les bulletins sont calculés un par un puis gardés en mémoire : les prochains affichages et impressions seront immédiats.
            </p>
        </div>
    );
}

export default Visualiser;
