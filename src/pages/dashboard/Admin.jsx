import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
    ArrowRight, Clock, GraduationCap, Presentation, School, ShieldCheck, TrendingDown, TrendingUp, UserCog, Users,
} from "lucide-react";
import { toast } from 'sonner'
import { api } from '../../utils/AxiosClient'
import usePrintable from "../../utils/usePrintable";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PrintableTable from "../../components/print/PrintableTable";
import PageHeader from "../../components/elements/PageHeader";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import AreaChart from "../../components/charts/AreaChart";
import { ActivityBoard, Metric, MiniBar, Panel } from "../../components/dashboard/Board";
import { Reveal } from "../../components/motion/Reveal";

const percent = (value) => `${Number(value ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;

function Admin() {
    const [dashboard, setDashboard] = useState(null);
    const { setNavbarActions } = useOutletContext();
    const { printRef, print } = usePrintable("Statistiques generales");

    useEffect(() => {
        let ignore = false;
        api.get('/statistics/admin/dashboard')
            .then((response) => { if (!ignore) setDashboard(response.data) })
            .catch((error) => { toast.error(error.message) })
        return () => { ignore = true }
    }, [])

    // Actualiser : le serveur recalcule les statistiques au lieu de servir son cache (5 min)
    useNavbarRefresh(() =>
        api.get('/statistics/admin/dashboard', { headers: { 'X-Refresh': '1' } })
            .then(({ data }) => setDashboard(data))
    );

    useEffect(() => {
        setNavbarActions({ onPrint: print });
        return () => setNavbarActions({});
    }, [setNavbarActions, print]);

    // Une ligne par établissement : effectifs, enseignants, réussite
    const schools = useMemo(() => {
        const students = dashboard?.general?.studentBySchool || [];
        const teachers = dashboard?.general?.teachersBySchool || [];
        const performance = dashboard?.performance?.by_school || [];
        const names = [...new Set([...students.map((s) => s.school_name), ...teachers.map((t) => t.school_name)])];
        return names.map((name) => {
            const s = students.find((x) => x.school_name === name);
            const t = teachers.find((x) => x.school_name === name);
            const p = performance.find((x) => x.nom_ecole === name);
            return {
                label: name,
                total: s?.total_students ?? 0,
                boys: s?.boys ?? 0,
                girls: s?.girls ?? 0,
                teachers: t?.total ?? 0,
                admis: p?.admis?.total ?? null,
                echecs: p?.echecs?.total ?? null,
                taux: p ? p.admis.taux : null,
            };
        }).sort((a, b) => b.total - a.total);
    }, [dashboard]);

    if (!dashboard) return <LoadingSkeleton message="Calcul des statistiques d'EduNote…" />;

    const general = dashboard.general || {};
    const global = dashboard.performance?.global;
    const withResults = schools.filter((s) => s.taux !== null);

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <PrintableTable
                ref={printRef}
                title="Statistiques generales - EDUNOTE"
                meta={[
                    { label: "Periode", value: dashboard.period || "-" },
                    { label: "Ecoles", value: general.schools ?? "-" },
                    { label: "Eleves", value: general.students?.total ?? "-" },
                    { label: "Enseignants", value: general.teachers ?? "-" },
                ]}
                columns={[
                    { key: "school", label: "Etablissement" },
                    { key: "total", label: "Effectif" },
                    { key: "boys", label: "Garcons" },
                    { key: "girls", label: "Filles" },
                    { key: "admis", label: "Admis" },
                    { key: "echecs", label: "Echecs" },
                    { key: "taux", label: "Taux reussite" },
                ]}
                rows={schools.map((s) => ({
                    school: s.label,
                    total: s.total,
                    boys: s.boys,
                    girls: s.girls,
                    admis: s.admis ?? "-",
                    echecs: s.echecs ?? "-",
                    taux: s.taux != null ? `${s.taux}%` : "-",
                }))}
            />

            <PageHeader
                kicker={dashboard.period || "Année en cours"}
                title={`Bonjour${general.user?.first_name ? `, ${general.user.first_name}` : ""}`}
                subtitle="Toutes les écoles validées sur EduNote, chacune sur son année scolaire en cours."
            />

            {/* Inscriptions d'établissements à valider */}
            {general.pending_schools > 0 && (
                <Reveal>
                    <Link to="/schools?status=pending"
                        className="glass-panel flex items-center justify-between gap-4 px-5 py-4 text-sm text-white/80 transition-colors hover:bg-white/10">
                        <span className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300"><Clock size={18} /></span>
                            <span><strong className="text-white">{general.pending_schools}</strong> inscription(s) d'établissement à valider</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">Valider <ArrowRight size={13} /></span>
                    </Link>
                </Reveal>
            )}

            {/* Toutes les statistiques en un bloc */}
            <ActivityBoard
                title="EduNote en chiffres"
                subtitle="Élèves inscrits par établissement, garçons et filles"
                columns="grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
                chart={
                    <AreaChart
                        tone="dark"
                        title="Élèves par établissement"
                        data={schools}
                        series={[{ key: "boys", label: "Garçons" }, { key: "girls", label: "Filles" }]}
                        emptyText="Aucun élève inscrit dans les écoles validées."
                    />
                }
            >
                <Metric icon={School} label="Écoles" value={general.schools ?? 0}
                    hint={`${general.pending_schools ?? 0} en attente · ${general.suspended_schools ?? 0} suspendue(s)`}
                    to="/schools" />
                <Metric icon={GraduationCap} label="Élèves" value={general.students?.total ?? 0}
                    hint={`${general.students?.boys ?? 0} G · ${general.students?.girls ?? 0} F`} />
                <Metric icon={Presentation} label="Enseignants" value={general.teachers ?? 0} />
                <Metric icon={UserCog} label="Directeurs" value={general.directors ?? 0}
                    hint={`${general.moderators ?? 0} modérateur(s)`} />
                <Metric icon={Users} label="Utilisateurs" value={general.users ?? 0}
                    hint={`${general.administrators ?? 0} admin. EduNote`} />
                <Metric icon={ShieldCheck} label="Classes" value={general.classrooms ?? 0} hint="utilisées cette année" />
                <Metric icon={TrendingUp} label="Réussite" value={global?.admis?.taux ?? null} decimals={1} format={(n) => percent(n)}
                    hint={global ? `${global.admis.total} admis sur ${global.inscrits.total}` : "Aucune moyenne"} />
                <Metric icon={TrendingDown} label="Échecs" value={global?.echecs?.total ?? 0}
                    tone={global?.echecs?.total > 0 ? "attention" : "default"}
                    hint={global ? percent(global.echecs.taux) : undefined} />
            </ActivityBoard>

            <Panel
                icon={School}
                title="Établissements"
                subtitle="Effectifs, enseignants et réussite de chaque école"
                bodyClassName="px-3 pb-4 sm:px-5"
                action={<Link to="/schools" className="ui-btn ui-btn-soft ui-btn-sm">Gérer <ArrowRight size={13} /></Link>}
            >
                {withResults.length > 1 && (
                    <div className="pt-2">
                        <AreaChart
                            title="Taux de réussite par établissement"
                            data={withResults}
                            series={[{ key: "taux", label: "Réussite" }]}
                            max={100}
                            formatValue={(v) => `${Math.round(v)} %`}
                        />
                    </div>
                )}
                <div className="mt-3 overflow-x-auto">
                    <table className="ui-table min-w-[720px]">
                        <thead>
                            <tr>
                                <th>Établissement</th>
                                <th>Élèves</th>
                                <th>Enseignants</th>
                                <th>Admis</th>
                                <th className="w-56">Réussite</th>
                                <th>Échecs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.length === 0 && (
                                <tr><td colSpan={6} className="py-8 text-center text-base-content/50">Aucun établissement validé pour le moment.</td></tr>
                            )}
                            {schools.map((s) => (
                                <tr key={s.label}>
                                    <td className="font-medium">{s.label}</td>
                                    <td className="tabular-nums text-base-content/75">{s.total} <span className="text-xs text-base-content/45">({s.boys} G · {s.girls} F)</span></td>
                                    <td className="tabular-nums">{s.teachers}</td>
                                    <td className="tabular-nums">{s.admis ?? "—"}</td>
                                    <td>
                                        {s.taux === null ? (
                                            <span className="text-xs text-base-content/45">Pas encore de moyennes</span>
                                        ) : (
                                            <span className="flex items-center gap-3">
                                                <MiniBar value={s.taux} tone={s.taux >= 50 ? "success" : "warning"} />
                                                <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums">{percent(s.taux)}</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="tabular-nums">{s.echecs ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </div>
    );
}

export default Admin
