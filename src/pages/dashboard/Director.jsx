import { useEffect, useMemo, useState } from "react"
import { Link, useOutletContext } from "react-router-dom"
import {
  ArrowRight, BookOpen, CalendarDays, ClipboardCheck, GraduationCap, Hash, LockKeyhole, MapPin, Phone,
  Presentation, School, TrendingDown, TrendingUp, Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/AxiosClient"
import { toast } from "sonner";
import usePrintable from "../../utils/usePrintable";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import PrintableTable from "../../components/print/PrintableTable";
import SchoolSetupGuide from "../../components/dashboard/SchoolSetupGuide";
import LoadingSkeleton from "../../components/LoadingSkeletoon";
import AreaChart from "../../components/charts/AreaChart";
import { ActivityBoard, Metric, MiniBar, Panel } from "../../components/dashboard/Board";
import { Reveal } from "../../components/motion/Reveal";

// Avancement de la mise en route (null si indisponible : la carte est simplement masquée)
const fetchSetup = () => api.get('/school/setup').then(({ data }) => data).catch(() => null);

// Demandes de correction de notes en attente (droit « calendrier »)
const fetchPendingUnlocks = () => api.get('/mark-unlocks').then(({ data }) => data.pending_count).catch(() => 0);

// Avancement de la saisie de la période en cours (droit « Bulletins »)
const fetchProgress = () => api.get('/mark-progress')
  .then(({ data }) => ({ period: data.period, summary: data.summary }))
  .catch(() => null);

const percent = (value) => `${Number(value ?? 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;

function Director() {
  const [dashboard, setDashboard] = useState();
  const [setup, setSetup] = useState(null);
  const [pendingUnlocks, setPendingUnlocks] = useState(0);
  const [progress, setProgress] = useState(null);
  const { can } = useAuth();
  const canCalendar = can("calendar");
  const canBulletins = can("bulletins");
  const { setNavbarActions } = useOutletContext();
  const { printRef, print } = usePrintable("Statistiques de l'etablissement");

  useEffect(() => {
    let ignore = false;
    api.get('/statistics/director/dashboard')
      .then((response) => { if (!ignore) setDashboard(response.data) })
      .catch((error) => { toast.error(error.message) })
    fetchSetup().then((data) => { if (!ignore) setSetup(data) })
    if (canCalendar) fetchPendingUnlocks().then((count) => { if (!ignore) setPendingUnlocks(count) })
    if (canBulletins) fetchProgress().then((data) => { if (!ignore) setProgress(data) })
    return () => { ignore = true }
  }, [canCalendar, canBulletins])

  // Actualiser : le serveur recalcule les statistiques au lieu de servir son cache (5 min)
  useNavbarRefresh(() =>
    Promise.all([
      api.get('/statistics/director/dashboard', { headers: { 'X-Refresh': '1' } })
        .then(({ data }) => setDashboard(data)),
      fetchSetup().then(setSetup),
      canCalendar ? fetchPendingUnlocks().then(setPendingUnlocks) : null,
      canBulletins ? fetchProgress().then(setProgress) : null,
    ])
  );

  useEffect(() => {
    setNavbarActions({ onPrint: print });
    return () => setNavbarActions({});
  }, [setNavbarActions, print]);

  // Une ligne par classe : effectifs (inscriptions) et réussite (moyennes enregistrées)
  const classes = useMemo(() => {
    const general = dashboard?.general?.students_by_classroom || [];
    const performance = dashboard?.performance?.by_classroom || [];
    const names = [...new Set([...general.map((c) => c.classroom_name), ...performance.map((c) => c.nom_classe)])];
    return names.map((name) => {
      const g = general.find((c) => c.classroom_name === name);
      const p = performance.find((c) => c.nom_classe === name);
      return {
        label: name,
        total: g?.total ?? p?.inscrits?.total ?? 0,
        boys: g?.boys ?? p?.inscrits?.garcons ?? 0,
        girls: g?.girls ?? p?.inscrits?.filles ?? 0,
        admis: p?.admis?.total ?? null,
        echecs: p?.echecs?.total ?? null,
        taux: p ? p.admis.taux : null,
      };
    });
  }, [dashboard]);

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <SchoolSetupGuide setup={setup} />
        <LoadingSkeleton message="Calcul des statistiques de l'établissement…" />
      </div>
    );
  }

  const general = dashboard.general || {};
  const global = dashboard.performance?.global;
  const withResults = classes.filter((c) => c.taux !== null);

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <PrintableTable
        ref={printRef}
        title={`Statistiques - ${general.school_info?.name || "Etablissement"}`}
        meta={[
          { label: "Eleves", value: general.students?.total ?? "-" },
          { label: "Enseignants", value: general.teachers?.total ?? "-" },
          { label: "Classes", value: general.classrooms ?? "-" },
        ]}
        columns={[
          { key: "classe", label: "Classe" },
          { key: "inscrits", label: "Inscrits (G/F)" },
          { key: "admis", label: "Admis" },
          { key: "tauxAdmis", label: "Taux reussite" },
          { key: "echecs", label: "Echecs" },
          { key: "tauxEchecs", label: "Taux echec" },
        ]}
        rows={(dashboard.performance?.by_classroom || []).map((c) => ({
          classe: c.nom_classe,
          inscrits: `${c.inscrits.total} (${c.inscrits.garcons}/${c.inscrits.filles})`,
          admis: c.admis.total,
          tauxAdmis: `${c.admis.taux}%`,
          echecs: c.echecs.total,
          tauxEchecs: `${c.echecs.taux}%`,
        }))}
      />

      <SchoolHero school={general.school_info} user={general.director} />

      {/* Assistant de mise en route : disparaît quand l'établissement est prêt */}
      <SchoolSetupGuide setup={setup} />

      {(pendingUnlocks > 0 || (progress && progress.summary.expected > 0)) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Notes à corriger après la clôture : réponse attendue de la direction */}
          {pendingUnlocks > 0 && (
            <Reveal>
              <Link to="/calendar#corrections"
                className="glass-panel flex h-full items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/10">
                <span className="flex items-center gap-3 text-sm text-white/80">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300"><LockKeyhole size={18} /></span>
                  <span><strong className="text-white">{pendingUnlocks} demande(s) de correction de notes</strong> attendent votre réponse.</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-amber-300">Répondre <ArrowRight size={13} /></span>
              </Link>
            </Reveal>
          )}

          {/* Saisie des notes de la période en cours */}
          {progress && progress.summary.expected > 0 && (
            <Reveal delay={0.05}>
              <Link to="/mark-progress"
                className="glass-panel flex h-full items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/10">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-glow-cyan/15 text-glow-cyan"><ClipboardCheck size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">
                      Saisie des notes — {progress.period.name} : {progress.summary.percent} %
                    </span>
                    <span className="mt-2 block h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-linear-to-r from-glow-cyan to-glow-indigo" style={{ width: `${progress.summary.percent}%` }} />
                    </span>
                    <span className="mt-1.5 block text-xs text-white/55">
                      {progress.summary.teachers_late > 0 ? `${progress.summary.teachers_late} enseignant(s) en retard` : "Tous les enseignants sont à jour"}
                    </span>
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-glow-cyan">Suivre <ArrowRight size={13} /></span>
              </Link>
            </Reveal>
          )}
        </div>
      )}

      {/* Toutes les statistiques en un bloc : courbe des effectifs, chiffres en colonnes */}
      <ActivityBoard
        title="Vue d'ensemble de l'établissement"
        subtitle="Effectifs par classe, garçons et filles"
        columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        chart={
          <AreaChart
            tone="dark"
            title="Effectifs par classe"
            data={classes}
            series={[{ key: "boys", label: "Garçons" }, { key: "girls", label: "Filles" }]}
            emptyText="Aucun élève inscrit pour le moment."
          />
        }
      >
        <Metric icon={GraduationCap} label="Élèves" value={general.students?.total ?? 0}
          hint={`${general.students?.boys ?? 0} garçons · ${general.students?.girls ?? 0} filles`} />
        <Metric icon={Presentation} label="Enseignants" value={general.teachers?.total ?? 0}
          hint={`${general.teachers?.boys ?? 0} hommes · ${general.teachers?.girls ?? 0} femmes`} />
        <Metric icon={School} label="Classes" value={general.classrooms ?? 0} hint="ouvertes cette année" />
        <Metric icon={TrendingUp} label="Taux de réussite" value={global?.admis?.taux ?? null} decimals={1}
          format={(n) => percent(n)} hint={global ? `${global.inscrits.total} élève(s) évalué(s)` : "Aucune moyenne enregistrée"} />
        <Metric icon={Users} label="Admis" value={global?.admis?.total ?? 0}
          hint={global ? `${global.admis.garcons} G · ${global.admis.filles} F` : undefined} />
        <Metric icon={TrendingDown} label="Échecs" value={global?.echecs?.total ?? 0}
          tone={global?.echecs?.total > 0 ? "attention" : "default"}
          hint={global ? `${percent(global.echecs.taux)} des évalués` : undefined} />
      </ActivityBoard>

      {/* Réussite par classe : courbe et tableau */}
      <Panel
        icon={BookOpen}
        title="Réussite par classe"
        subtitle={`Taux de réussite d'après les moyennes enregistrées (${(dashboard.period || "annuel").toLowerCase()})`}
        bodyClassName="px-3 pb-4 sm:px-5"
      >
        {withResults.length > 1 && (
          <div className="pt-2">
            <AreaChart
              title="Taux de réussite par classe"
              data={withResults}
              series={[{ key: "taux", label: "Réussite" }]}
              max={100}
              formatValue={(v) => `${Math.round(v)} %`}
            />
          </div>
        )}
        <div className="mt-3 overflow-x-auto">
          <table className="ui-table min-w-[640px]">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Élèves</th>
                <th>Admis</th>
                <th className="w-56">Réussite</th>
                <th>Échecs</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-base-content/50">Aucune classe avec des élèves pour le moment.</td></tr>
              )}
              {classes.map((c) => (
                <tr key={c.label}>
                  <td className="font-medium">{c.label}</td>
                  <td className="tabular-nums text-base-content/75">{c.total} <span className="text-xs text-base-content/45">({c.boys} G · {c.girls} F)</span></td>
                  <td className="tabular-nums">{c.admis ?? "—"}</td>
                  <td>
                    {c.taux === null ? (
                      <span className="text-xs text-base-content/45">Pas encore de moyennes</span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <MiniBar value={c.taux} tone={c.taux >= 50 ? "success" : "warning"} />
                        <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums">{percent(c.taux)}</span>
                      </span>
                    )}
                  </td>
                  <td className="tabular-nums">{c.echecs ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  )
}

const EVALUATION_LABELS = { sequence: "Par séquences", skill: "Par compétences", competence: "Par compétences" };

/** Bandeau de l'établissement, posé sur le fond d'écran */
function SchoolHero({ school, user }) {
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const facts = [
    [MapPin, school?.city],
    [Phone, school?.phone],
    [Hash, school?.code],
    [GraduationCap, EVALUATION_LABELS[school?.evaluation_type]],
  ].filter(([, value]) => value);

  return (
    <Reveal as="section" className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md">
          {school?.logo ? <img src={school.logo} alt="" className="h-full w-full object-cover" /> : <School size={26} />}
        </span>
        <div className="min-w-0">
          <span className="kicker text-white/70">Bonjour{user?.first_name ? `, ${user.first_name}` : ""}</span>
          <h1 className="mt-2 text-[1.5rem] leading-tight font-semibold tracking-tight text-white break-words sm:text-[1.85rem]">{school?.name}</h1>
          {school?.motto && <p className="mt-1 text-sm text-white/55 italic">« {school.motto} »</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {facts.map(([Icon, value]) => (
          <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/75 ring-1 ring-white/10">
            <Icon size={13} className="text-glow-cyan" /> {value}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/75 ring-1 ring-white/10 first-letter:uppercase">
          <CalendarDays size={13} className="text-glow-cyan" /> {today}
        </span>
      </div>
    </Reveal>
  );
}

export default Director
