import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "sonner";
import { Save, Trash2, AlertCircle, CheckCircle2, ChevronRight, User, CloudUpload, HardDrive } from "lucide-react";

// Import de tes composants existants (conservés pour la rétrocompatibilité)
import PageHeader from "../../components/elements/PageHeader";
import Loading from "../../components/Loading";
import { hasPending, removeByDedupeKey } from "../../utils/offline/outbox";
import { OUTBOX_EVENT } from "../../utils/offline/status";
import useNavbarRefresh from "../../hooks/useNavbarRefresh";
import MarkLockBanner from "../../components/marks/MarkLockBanner";

const DRAFT_PREFIX = "edunote_marks_draft";

// Affectations de l'enseignant, puis séquences et trimestres de l'année en cours
// de CHAQUE école où il enseigne (chaque école gère son propre calendrier)
async function fetchMetaData(userId) {
  const { data } = await axiosClient.get(`/teachers/${userId}/assignments`);
  const assignments = data.data || [];
  const schoolIds = [...new Set(assignments.map((a) => a.school_id))];

  const calendars = Object.fromEntries(await Promise.all(schoolIds.map(async (schoolId) => {
    const [sequencesRes, termsRes] = await Promise.all([
      axiosClient.get("/sequences", { params: { school_id: schoolId } }),
      axiosClient.get("/terms", { params: { school_id: schoolId } }),
    ]);
    return [schoolId, { sequences: sequencesRes.data || [], terms: termsRes.data || [] }];
  })));

  return { assignments, calendars, loading: false };
}

const EMPTY_CALENDAR = { sequences: [], terms: [] };

const markText = (mark) => (mark !== null && mark !== undefined ? String(mark) : "");

// Notes enregistrées sur le serveur, au format de la saisie :
// séquence { inscription: "15" } ; compétences { inscription: { compétence: "12" } }
function serverMarksOf(students, skills, isSequence) {
  const result = {};
  students.forEach((student) => {
    if (isSequence) {
      result[student.student_enrollment_id] = markText(student.mark);
      return;
    }
    const bySkill = {};
    (Array.isArray(student.marks) ? student.marks : []).forEach((m) => { bySkill[m.skill_id] = markText(m.mark); });
    result[student.student_enrollment_id] = Object.fromEntries(skills.map((skill) => [skill.id, bySkill[skill.id] ?? ""]));
  });
  return result;
}

// Chargement : le brouillon local passe devant les notes du serveur
function applyDraft(server, draft, isSequence) {
  if (!draft) return server;
  return Object.fromEntries(Object.entries(server).map(([id, value]) => [
    id,
    isSequence
      ? draft[id] ?? value
      : Object.fromEntries(Object.entries(value).map(([skillId, mark]) => [skillId, draft[id]?.[skillId] ?? mark])),
  ]));
}

// Actualisation : une note modifiée sur cet appareil depuis le dernier chargement est
// conservée ; les autres prennent la valeur actuelle du serveur (saisie faite ailleurs)
function keepLocalEdits(server, current, previous, isSequence) {
  const pick = (mine, before, fresh) => (mine !== undefined && mine !== before ? mine : fresh);
  return Object.fromEntries(Object.entries(server).map(([id, value]) => [
    id,
    isSequence
      ? pick(current[id], previous[id], value)
      : Object.fromEntries(Object.entries(value).map(([skillId, mark]) => [
          skillId,
          pick(current[id]?.[skillId], previous[id]?.[skillId], mark),
        ])),
  ]));
}

export default function TeacherMarkEntry() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================
  // ETAT GLOBAL (Méta-données)
  // ==========================================
  const [metaData, setMetaData] = useState({
    assignments: [],
    calendars: {}, // { [école]: { sequences, terms } }
    loading: true,
  });

  // ==========================================
  // ETAT DES SELECTIONS (Filtres)
  // ==========================================
  // 🐛 updateFilter() écrit "assignmentId"/"sequenceId"/"termId" dans l'URL : on les relit
  // (en gardant "assignment" utilisé par le hub enseignant), sinon un rechargement
  // de la page — notamment hors ligne — perdait la sélection.
  const [filters, setFilters] = useState({
    assignmentId: searchParams.get("assignmentId") || searchParams.get("assignment") || "",
    sequenceId: searchParams.get("sequenceId") || searchParams.get("sequence") || "",
    termId: searchParams.get("termId") || searchParams.get("term") || "",
    activeSkillId: "", // Utilisé principalement pour la vue mobile en mode compétence
  });

  // ==========================================
  // ETAT DE LA GRILLE (Données du serveur)
  // ==========================================
  const [gridData, setGridData] = useState({
    students: [],
    skills: [],
    loading: false,
    saving: false,
    isLoaded: false,
    activeDraftKey: null,
    lock: null, // clôture de la saisie (renvoyée avec la grille)
  });

  // ==========================================
  // ETAT DES NOTES (Saisie en cours)
  // ==========================================
  // Structure: 
  // Sequence Mode: { studentEnrollmentId: "15" }
  // Skill Mode: { studentEnrollmentId: { skillId: "12" } }
  const [marks, setMarks] = useState({});
  const [draftExists, setDraftExists] = useState(false);
  // 🐛 Le brouillon n'est écrit qu'après une vraie saisie : auparavant le simple
  // chargement de la grille créait un brouillon et affichait l'alerte à tort.
  const [isDirty, setIsDirty] = useState(false);
  // Hors ligne : notes enregistrées sur l'appareil, en attente d'envoi
  const [pendingSync, setPendingSync] = useState(false);
  const [gridCachedAt, setGridCachedAt] = useState(null);

  // ==========================================
  // DERIVES ET MEMOIZATION
  // ==========================================
  const selectedAssignment = useMemo(
    () => metaData.assignments.find((a) => String(a.id) === String(filters.assignmentId)),
    [metaData.assignments, filters.assignmentId]
  );

  const evaluationMode = selectedAssignment?.school?.evaluation_type || "sequence";
  // Séquences et trimestres de l'école de l'affectation choisie
  const calendar = metaData.calendars[selectedAssignment?.school_id] || EMPTY_CALENDAR;
  const isSequenceMode = evaluationMode === "sequence";
  const isCompetenceMode = evaluationMode === "skill";

  // Clé unique pour le brouillon basée sur la sélection actuelle
  const draftKey = useMemo(() => {
    if (!user?.id || !filters.assignmentId) return null;
    if (isSequenceMode && !filters.sequenceId) return null;
    if (isCompetenceMode && !filters.termId) return null;
    
    const periodKey = isSequenceMode ? `seq_${filters.sequenceId}` : `term_${filters.termId}`;
    return `${DRAFT_PREFIX}_u${user.id}_a${filters.assignmentId}_${periodKey}`;
  }, [user, filters, isSequenceMode, isCompetenceMode]);

  // Sélection courante : une grille reçue après un changement d'affectation ou de période est ignorée
  const currentDraftKey = useRef(draftKey);
  useEffect(() => {
    currentDraftKey.current = draftKey;
  }, [draftKey]);

  // Dernière saisie, lue par l'actualisation (l'enseignant peut taper pendant le rechargement)
  const latestMarks = useRef(marks);
  useEffect(() => {
    latestMarks.current = marks;
  }, [marks]);


  // ==========================================
  // CHARGEMENT INITIAL DES META-DONNEES
  // ==========================================
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchInitialData = async () => {
      try {
        setMetaData(await fetchMetaData(user.id));
      } catch (error) {
        toast.error("Impossible de récupérer les paramètres initiaux.");
        console.error(error);
        setMetaData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchInitialData();
  }, [authLoading, user]);


  // ==========================================
  // GESTIONNAIRES D'EVENEMENTS (Filtres)
  // ==========================================
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    
    // Mise à jour de l'URL pour partager le lien
    setSearchParams((prevParams) => {
      if (value) prevParams.set(key, value);
      else prevParams.delete(key);
      return prevParams;
    });

    // Si on change d'affectation, on réinitialise la grille
    if (key === "assignmentId") {
      resetGrid();

      // Autre école : ses séquences et trimestres sont différents, la période est à rechoisir
      const next = metaData.assignments.find((a) => String(a.id) === String(value));
      if (next && next.school_id !== selectedAssignment?.school_id) {
        setFilters((prev) => ({ ...prev, assignmentId: value, sequenceId: "", termId: "" }));
        setSearchParams((prevParams) => {
          prevParams.delete("sequenceId");
          prevParams.delete("termId");
          return prevParams;
        });
      }
    }
  };

  const resetGrid = useCallback(() => {
    setGridData({ students: [], skills: [], loading: false, saving: false, isLoaded: false, activeDraftKey: null, lock: null });
    setMarks({});
    setDraftExists(false);
    setIsDirty(false);
    setPendingSync(false);
    setGridCachedAt(null);
  }, []);

  // Nettoyage de la grille si on change la période (Séquence/Trimestre)
  useEffect(() => {
    resetGrid();
  }, [filters.sequenceId, filters.termId, resetGrid]);


  // ==========================================
  // CHARGEMENT DE LA GRILLE (API)
  // ==========================================
  // silent : actualisation depuis la barre du haut, la grille reste affichée pendant le rechargement
  const loadGrid = async ({ silent = false } = {}) => {
    if (!selectedAssignment) return toast.warning("Sélectionnez une affectation.");
    if (isSequenceMode && !filters.sequenceId) return toast.warning("Sélectionnez une séquence.");
    if (isCompetenceMode && !filters.termId) return toast.warning("Sélectionnez un trimestre.");

    if (!silent) setGridData((prev) => ({ ...prev, loading: true, isLoaded: false }));

    try {
      const endpoint = isSequenceMode ? "/sequence-marks/load" : "/skill-marks/load";
      const params = {
        classroom_id: selectedAssignment.classroom_id,
        subject_id: selectedAssignment.subject_id,
        school_id: selectedAssignment.school_id,
        ...(isSequenceMode ? { sequence_id: filters.sequenceId } : { term_id: filters.termId }),
      };

      const response = await axiosClient.get(endpoint, { params });
      if (currentDraftKey.current !== draftKey) return;
      const { data } = response;
      const payload = data.data || data;
      setGridCachedAt(response.fromCache ? response.cachedAt : null);
      
      const loadedStudents = payload.students || [];
      const loadedSkills = payload.skills || [];

      // Initialisation de la compétence active pour le mobile (conservée lors d'une actualisation)
      const keepActiveSkill = silent && loadedSkills.some((skill) => String(skill.id) === String(filters.activeSkillId));
      if (isCompetenceMode && loadedSkills.length > 0 && !keepActiveSkill) {
        updateFilter("activeSkillId", String(loadedSkills[0].id));
      }

      const pending = await hasPending(draftKey);
      if (currentDraftKey.current !== draftKey) return;
      setIsDirty(false);
      setPendingSync(pending);

      // Constitution du dictionnaire des notes
      const serverMarks = serverMarksOf(loadedStudents, loadedSkills, isSequenceMode);
      let initialMarks;

      if (silent) {
        // Actualisation : seules les notes modifiées ici sont conservées, le reste vient du serveur
        const previousServerMarks = serverMarksOf(gridData.students, gridData.skills, isSequenceMode);
        initialMarks = keepLocalEdits(serverMarks, latestMarks.current, previousServerMarks, isSequenceMode);

        // Le brouillon ne garde que la grille fusionnée, ou disparaît s'il n'y a plus rien à envoyer
        if (draftKey) {
          const hasEdits = JSON.stringify(initialMarks) !== JSON.stringify(serverMarks);
          if (hasEdits) localStorage.setItem(draftKey, JSON.stringify(initialMarks));
          else if (!pending) localStorage.removeItem(draftKey);
          setDraftExists(Boolean(localStorage.getItem(draftKey)));
        }
      } else {
        // Traitement du brouillon local (Fusion BD + Brouillon)
        const savedDraft = draftKey ? localStorage.getItem(draftKey) : null;
        const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;
        setDraftExists(!!parsedDraft);
        initialMarks = applyDraft(serverMarks, parsedDraft, isSequenceMode);
      }

      setMarks(initialMarks);
      setGridData({ students: loadedStudents, skills: loadedSkills, loading: false, saving: false, isLoaded: true, activeDraftKey: draftKey, lock: payload.lock ?? null });
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du chargement de la grille.");
      setGridData((prev) => ({ ...prev, loading: false }));
    }
  };


  // Actualiser : affectations et périodes, puis les notes de la grille ouverte
  // (les notes modifiées sur cet appareil et pas encore enregistrées sont conservées)
  useNavbarRefresh(async () => {
    if (!user) return;
    setMetaData(await fetchMetaData(user.id));
    if (gridData.isLoaded) await loadGrid({ silent: true });
  });


  // ==========================================
  // SAISIE ET VALIDATION DES NOTES
  // ==========================================
  const formatMarkInput = (value) => {
    if (value === "") return "";
    let normalized = value.replace(/[^0-9.]/g, ""); // Accepte chiffres et point
    
    // Empêcher plusieurs points
    const parts = normalized.split('.');
    if (parts.length > 2) normalized = parts[0] + '.' + parts.slice(1).join('');
    
    // Plafonner à 20
    if (Number(normalized) > 20) return "20";
    return normalized;
  };

  const handleSetMark = (enrollmentId, value, skillId = null) => {
    const formattedVal = formatMarkInput(value);
    setIsDirty(true);

    setMarks((prev) => {
      const newMarks = { ...prev };
      
      if (isSequenceMode) {
        newMarks[enrollmentId] = formattedVal;
      } else {
        newMarks[enrollmentId] = {
          ...newMarks[enrollmentId],
          [skillId]: formattedVal,
        };
      }
      return newMarks;
    });
  };


  // ==========================================
  // GESTION DU BROUILLON (Auto-save)
  // ==========================================
  useEffect(() => {
    if (isDirty && gridData.isLoaded && gridData.activeDraftKey) {
      // Sauvegarde automatique strictement liée à la grille active
      localStorage.setItem(gridData.activeDraftKey, JSON.stringify(marks));
      setDraftExists(true);
    }
  }, [marks, isDirty, gridData.isLoaded, gridData.activeDraftKey]);

  // Les notes en attente ont été envoyées par la synchronisation automatique
  useEffect(() => {
    if (!pendingSync || !draftKey) return;

    const onOutboxChange = async () => {
      if (!(await hasPending(draftKey))) {
        setPendingSync(false);
        setDraftExists(!!localStorage.getItem(draftKey));
      }
    };

    window.addEventListener(OUTBOX_EVENT, onOutboxChange);
    return () => window.removeEventListener(OUTBOX_EVENT, onOutboxChange);
  }, [pendingSync, draftKey]);

  const clearDraft = async () => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
      // Le brouillon abandonné ne doit pas non plus partir à la prochaine synchronisation
      await removeByDedupeKey(draftKey);
      setDraftExists(false);
      setPendingSync(false);
      loadGrid(); // Recharger depuis la base de données
      toast.success("Brouillon effacé, notes restaurées depuis le serveur.");
    }
  };


  // ==========================================
  // SOUMISSION AU SERVEUR (Enregistrement)
  // ==========================================
  const saveMarksToServer = async () => {
    setGridData((prev) => ({ ...prev, saving: true }));

    try {
      const endpoint = isSequenceMode ? "/sequence-marks/save" : "/skill-marks/save";
      const payload = {
        classroom_id: selectedAssignment.classroom_id,
        subject_id: selectedAssignment.subject_id,
        marks: [],
      };

      if (isSequenceMode) {
        payload.sequence_id = filters.sequenceId;
        payload.marks = gridData.students.map((student) => ({
          student_enrollment_id: student.student_enrollment_id,
          mark: marks[student.student_enrollment_id] === "" ? null : Number(marks[student.student_enrollment_id]),
        }));
      } else {
        payload.term_id = filters.termId;
        payload.marks = gridData.students.flatMap((student) => {
          const stMarks = marks[student.student_enrollment_id] || {};
          return gridData.skills.map((skill) => ({
            student_enrollment_id: student.student_enrollment_id,
            skill_id: skill.id,
            mark: stMarks[skill.id] === "" ? null : Number(stMarks[skill.id]),
          }));
        });
      }

      const response = await axiosClient.post(endpoint, payload, {
        // Hors ligne : la grille complète est mise en file d'attente (envoi idempotent)
        offlineQueue: {
          label: `Notes ${selectedAssignment.classroom?.name || ""} — ${selectedAssignment.subject?.name || ""}`.trim(),
          dedupeKey: draftKey,
          meta: { draftKey },
        },
      });

      setIsDirty(false);

      if (response.queued) {
        // On garde le brouillon local jusqu'à l'envoi effectif
        if (draftKey) localStorage.setItem(draftKey, JSON.stringify(marks));
        setDraftExists(true);
        setPendingSync(true);
        toast.info("Hors ligne : notes enregistrées sur cet appareil. Elles seront envoyées automatiquement au retour du réseau.");
        return;
      }

      // Nettoyage après succès (y compris une ancienne version restée en file d'attente)
      if (draftKey) {
        localStorage.removeItem(draftKey);
        await removeByDedupeKey(draftKey);
      }
      setDraftExists(false);
      setPendingSync(false);

      toast.success("Toutes les notes ont été enregistrées avec succès !");
    } catch (error) {
      toast.error(error.message || "Échec de l'enregistrement des notes.");
      console.error(error);
    } finally {
      setGridData((prev) => ({ ...prev, saving: false }));
    }
  };


  // ==========================================
  // CALCULS STATISTIQUES (Progression)
  // ==========================================
  // 🐛 Libellé de la compétence affichée sur mobile (filters.activeSkillName n'était jamais défini)
  const activeSkillName = gridData.skills.find((skill) => String(skill.id) === String(filters.activeSkillId))?.name;

  // Saisie clôturée (sans autorisation de correction) : grille en lecture seule
  const locked = Boolean(gridData.isLoaded && gridData.lock && !gridData.lock.can_edit);

  const completionStats = useMemo(() => {
    let totalFields = 0;
    let filledFields = 0;

    if (isSequenceMode) {
      totalFields = gridData.students.length;
      filledFields = gridData.students.filter(s => marks[s.student_enrollment_id] !== "" && marks[s.student_enrollment_id] !== undefined).length;
    } else {
      totalFields = gridData.students.length * gridData.skills.length;
      gridData.students.forEach(s => {
        const sMarks = marks[s.student_enrollment_id] || {};
        gridData.skills.forEach(skill => {
          if (sMarks[skill.id] !== "" && sMarks[skill.id] !== undefined) filledFields++;
        });
      });
    }

    const percentage = totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
    return { filled: filledFields, total: totalFields, percentage };
  }, [marks, gridData, isSequenceMode]);


  // ==========================================
  // RENDU UI
  // ==========================================
  if (authLoading || metaData.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <Loading load={true} />
      </div>
    );
  }

  return (
    <main className=" pb-28">
      <PageHeader
        title="Saisie des notes"
        subtitle="Gérez les évaluations de vos classes avec sauvegarde automatique"
      />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* === PANNEAU DE CONFIGURATION === */}
        <section className="surface p-5">
          <div className="grid gap-5 md:grid-cols-4 items-end">

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-base-content/60 mb-2 block">
                Affectation (Classe / Matière)
              </label>
              <select
                className="ui-field w-full"
                value={filters.assignmentId}
                onChange={(e) => updateFilter("assignmentId", e.target.value)}
              >
                <option value="">Sélectionner...</option>
                {metaData.assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.classroom?.name} — {a.subject?.name}
                  </option>
                ))}
              </select>
            </div>

            {isSequenceMode && (
              <div className="md:col-span-1">
                <label className="text-xs font-medium text-base-content/60 mb-2 block">Séquence</label>
                <select
                  className="ui-field w-full"
                  value={filters.sequenceId}
                  onChange={(e) => updateFilter("sequenceId", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {calendar.sequences.map((seq) => (
                    <option key={seq.id} value={seq.id}>{seq.name} ({seq.term?.name}){seq.is_closed ? " — clôturée" : ""}</option>
                  ))}
                </select>
                {selectedAssignment && calendar.sequences.length === 0 && (
                  <p className="mt-2 text-xs text-warning">
                    Aucune séquence dans cet établissement : le chef d'établissement doit les créer dans « Calendrier ».
                  </p>
                )}
              </div>
            )}

            {isCompetenceMode && (
              <div className="md:col-span-1">
                <label className="text-xs font-medium text-base-content/60 mb-2 block">Trimestre</label>
                <select
                  className="ui-field w-full"
                  value={filters.termId}
                  onChange={(e) => updateFilter("termId", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {calendar.terms.map((term) => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
                </select>
                {selectedAssignment && calendar.terms.length === 0 && (
                  <p className="mt-2 text-xs text-warning">
                    Aucun trimestre dans cet établissement : le chef d'établissement doit les créer dans « Calendrier ».
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => loadGrid()}
                disabled={gridData.loading}
                className="ui-btn ui-btn-primary"
              >
                {gridData.loading ? (
                  <span>Chargement...</span>
                ) : (
                  <>Générer la grille <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </div>

          {/* Grille lue depuis l'appareil (hors ligne) */}
          {gridCachedAt && gridData.isLoaded && (
            <div className="mt-5 flex items-center gap-3 rounded-md bg-info/10 p-4 text-sm text-base-content/80">
              <HardDrive size={18} className="shrink-0 text-info" />
              <span>
                Grille chargée depuis cet appareil (dernière consultation le {new Date(gridCachedAt).toLocaleString("fr-FR")}).
              </span>
            </div>
          )}

          {/* Notes en attente d'envoi (enregistrées hors ligne) */}
          {pendingSync && gridData.isLoaded && (
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary/8 p-4 text-sm text-base-content/80 ring-1 ring-primary/15">
              <CloudUpload size={18} className="shrink-0 text-primary" />
              <span>
                <strong>En attente de synchronisation.</strong> Ces notes sont enregistrées sur l'appareil et seront envoyées automatiquement dès le retour du réseau.
              </span>
            </div>
          )}

          {/* Clôture de la saisie : date limite, lecture seule, demande de correction */}
          {gridData.isLoaded && selectedAssignment && (
            <MarkLockBanner
              lock={gridData.lock}
              target={{
                school_id: selectedAssignment.school_id,
                classroom_id: selectedAssignment.classroom_id,
                subject_id: selectedAssignment.subject_id,
                ...(isSequenceMode ? { sequence_id: filters.sequenceId } : { term_id: filters.termId }),
              }}
              onChanged={() => loadGrid({ silent: true })}
            />
          )}

          {/* Indicateur de brouillon local */}
          {draftExists && !pendingSync && gridData.isLoaded && (
            <div className="mt-5 flex flex-wrap gap-4 items-center justify-between rounded-md bg-warning/10 p-4 text-sm">
              <div className="flex items-center gap-3 text-base-content/80">
                <AlertCircle size={18} className="text-warning" />
                <span>
                  <strong>Brouillon non enregistré</strong> en base de données. Vos saisies sont gardées localement.
                </span>
              </div>
              <button onClick={clearDraft} className="ui-btn bg-warning/10 text-warning ui-btn-sm">
                <Trash2 size={14} /> Restaurer B.D
              </button>
            </div>
          )}
        </section>


        {/* === ZONE DE SAISIE === */}
        {gridData.isLoaded && (
          <section className="surface overflow-hidden relative flex flex-col">

            {/* Header de la zone */}
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-semibold text-base-content flex items-center gap-2">
                  Grille d'évaluation
                  <span className="ui-chip bg-primary/10 text-primary">
                    {gridData.students.length} élèves
                  </span>
                </h2>
                <p className="text-sm text-base-content/50 mt-1">
                  Les notes doivent être comprises entre 0 et 20.
                </p>
              </div>

              {/* Sélecteur de compétence pour la vue Mobile (caché sur Desktop) */}
              {isCompetenceMode && (
                <div className="w-full sm:w-auto md:hidden">
                  <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Compétence affichée</label>
                  <select
                    className="ui-field w-full"
                    value={filters.activeSkillId}
                    onChange={(e) => updateFilter("activeSkillId", e.target.value)}
                  >
                    {gridData.skills.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {gridData.students.length === 0 ? (
              <div className="p-16 text-center text-base-content/50 flex flex-col items-center">
                <User size={40} className="text-base-content/20 mb-4" />
                <p className="text-base font-medium text-base-content">Aucun élève trouvé</p>
                <p className="text-sm mt-1">Cette classe ne contient aucun élève inscrit pour le moment.</p>
              </div>
            ) : (
              <>
              
              {/* ================= MOBILE ================= */}
              <div className="md:hidden space-y-3">

                {gridData.students.map((student, index) => {

                  const stId = student.student_enrollment_id;

                  const hasMark = isSequenceMode
                    ? marks[stId] !== "" && marks[stId] !== undefined
                    : marks[stId]?.[filters.activeSkillId] !== "" &&
                      marks[stId]?.[filters.activeSkillId] !== undefined;

                  return (

                    <div
                      key={stId}
                      className={`rounded-2xl p-4 ring-1 ring-base-300/60
                        ${
                          hasMark
                            ? "bg-success/10"
                            : "bg-base-100"
                        }`}
                    >

                      <div className="flex items-start justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <span className="text-xs font-medium text-primary">
                              #{index + 1}
                            </span>

                            <h3 className="font-medium text-base-content capitalize break-words">
                              {student.name}
                            </h3>

                          </div>

                          <p className="text-xs text-base-content/50 mt-1">
                            {student.matricule}
                          </p>

                        </div>

                        {hasMark && (
                          <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}

                      </div>

                      <div className="mt-4">

                        <label className="block text-xs font-medium text-base-content/60 mb-2">
                          {isSequenceMode
                            ? "Note /20"
                            : activeSkillName || "Note /20"}
                        </label>

                        {isSequenceMode ? (

                          <input
                            type="text"
                            inputMode="decimal"
                            value={marks[stId] ?? ""}
                            onChange={(e) =>
                              handleSetMark(stId, e.target.value)
                            }
                            disabled={gridData.saving || locked}
                            className="ui-field w-full text-center text-lg font-semibold disabled:opacity-50"
                            placeholder="0 - 20"
                          />

                        ) : (

                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              marks[stId]?.[filters.activeSkillId] ?? ""
                            }
                            onChange={(e) =>
                              handleSetMark(
                                stId,
                                e.target.value,
                                filters.activeSkillId
                              )
                            }
                            disabled={
                              gridData.saving ||
                              locked ||
                              !filters.activeSkillId
                            }
                            className="ui-field w-full text-center text-lg font-semibold disabled:opacity-50"
                            placeholder="0 - 20"
                          />

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>

              {/* ================= DESKTOP ================= */}

              <div className="hidden w-full overflow-x-auto px-3 pb-3 md:block">

                <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left text-sm">

                  {/* EN-TETES */}
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 min-w-[250px] rounded-l-xl px-4 py-3 bg-base-100 text-[11px] font-semibold tracking-wider text-base-content/55 uppercase">
                        Élève
                      </th>

                      {isSequenceMode && (
                        <th className="w-40 rounded-r-xl px-4 py-3 text-center bg-base-100 text-[11px] font-semibold tracking-wider text-base-content/55 uppercase">
                          Note / 20
                        </th>
                      )}

                      {/* Desktop : Affichage de toutes les compétences en colonnes */}
                      {isCompetenceMode && gridData.skills.map(skill => (
                        <th key={skill.id} className="hidden min-w-[140px] px-3 py-3 text-center md:table-cell bg-base-100 text-[11px] font-semibold tracking-wider text-base-content/55 uppercase">
                          <div className="truncate max-w-[150px] mx-auto" title={skill.name}>
                            {skill.name}
                          </div>
                        </th>
                      ))}

                      {/* Mobile : Colonne unique pour la compétence active */}
                      {isCompetenceMode && (
                        <th className="w-32 rounded-r-xl px-4 py-3 text-center md:hidden bg-base-100 text-[11px] font-semibold tracking-wider text-base-content/55 uppercase">
                          Note / 20
                        </th>
                      )}
                    </tr>
                  </thead>

                  {/* CORPS (Lignes d'élèves) */}
                  <tbody>
                    {gridData.students.map((student, idx) => {
                      const stId = student.student_enrollment_id;

                      return (
                        <tr key={stId} className="group transition-colors duration-150 hover:bg-primary/4 [&>td]:border-b [&>td]:border-base-300/60 last:[&>td]:border-0">
                          {/* Cellule Élève fixe */}
                          <td className="sticky left-0 z-10 bg-white px-4 py-3 transition-colors duration-150 group-hover:bg-[#F8F8FE]">
                            <div className="flex items-center gap-3">
                              <span className="text-base-content/40 font-medium text-xs w-5 text-right">{idx + 1}.</span>
                              <div>
                                <div className="font-medium text-base-content capitalize">{student.name}</div>
                                <div className="text-xs text-base-content/50 mt-0.5">{student.matricule}</div>
                              </div>
                            </div>
                          </td>

                          {/* Saisie Séquence */}
                          {isSequenceMode && (
                            <td className="p-3 text-center">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={marks[stId] ?? ""}
                                onChange={(e) => handleSetMark(stId, e.target.value)}
                                disabled={gridData.saving || locked}
                                className="ui-field w-24 text-center font-medium disabled:opacity-50"
                                placeholder="--"
                              />
                            </td>
                          )}

                          {/* Saisie Compétences (Desktop - Multi-colonnes) */}
                          {isCompetenceMode && gridData.skills.map(skill => (
                            <td key={skill.id} className="p-3 text-center hidden md:table-cell">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={marks[stId]?.[skill.id] ?? ""}
                                onChange={(e) => handleSetMark(stId, e.target.value, skill.id)}
                                disabled={gridData.saving || locked}
                                className="ui-field w-20 mx-auto block text-center font-medium disabled:opacity-50"
                                placeholder="--"
                              />
                            </td>
                          ))}

                          {/* Saisie Compétence (Mobile - Colonne unique) */}
                          {isCompetenceMode && (
                            <td className="p-3 text-center md:hidden">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={marks[stId]?.[filters.activeSkillId] ?? ""}
                                onChange={(e) => handleSetMark(stId, e.target.value, filters.activeSkillId)}
                                disabled={gridData.saving || locked || !filters.activeSkillId}
                                className="ui-field w-24 text-center font-medium disabled:opacity-50"
                                placeholder="--"
                              />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

              </div>
              
              
              
              
              
              
              
              
              </>
            )}
          </section>
        )}
      </div>

      {/* === BARRE D'ACTION FLOTTANTE === */}
      {gridData.isLoaded && gridData.students.length > 0 && (
        <div className="glass-panel glow-top fixed right-3 bottom-24 left-3 z-40 bg-night/85 p-4 shadow-2xl shadow-black/50 md:right-6 lg:bottom-4 lg:left-[var(--content-left)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Statistiques */}
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-base-content/70">
                <CheckCircle2 size={16} className={completionStats.percentage === 100 ? "text-success" : "text-base-content/30"} />
                <span>
                  <b className="text-base-content">{completionStats.filled}</b> / {completionStats.total} notes saisies
                </span>
              </div>

              <div className="w-32 h-1.5 bg-base-300 rounded-sm overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full bg-linear-to-r ${completionStats.percentage === 100 ? 'from-emerald-500 to-teal-400' : 'from-primary to-glow-cyan'}`}
                  style={{ width: `${completionStats.percentage}%` }}
                />
              </div>
            </div>

            {/* Bouton de sauvegarde final */}
            <button
              onClick={saveMarksToServer}
              disabled={gridData.saving || locked}
              className="ui-btn ui-btn-success"
            >
              <Save size={18} />
              {gridData.saving ? "Enregistrement en cours..." : locked ? "Saisie clôturée" : "Enregistrer dans la base"}
            </button>

          </div>
        </div>
      )}

    </main>
  );
}