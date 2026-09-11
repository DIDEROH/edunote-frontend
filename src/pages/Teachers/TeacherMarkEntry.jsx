import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "sonner";
import { Save, Trash2, AlertCircle, CheckCircle2, ChevronRight, User } from "lucide-react";

// Import de tes composants existants (conservés pour la rétrocompatibilité)
import PageHeader from "../../components/elements/PageHeader";
import Loading from "../../components/Loading";

const DRAFT_PREFIX = "edunote_marks_draft";

export default function TeacherMarkEntry() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================
  // ETAT GLOBAL (Méta-données)
  // ==========================================
  const [metaData, setMetaData] = useState({
    assignments: [],
    sequences: [],
    terms: [],
    loading: true,
  });

  // ==========================================
  // ETAT DES SELECTIONS (Filtres)
  // ==========================================
  const [filters, setFilters] = useState({
    assignmentId: searchParams.get("assignment") || "",
    sequenceId: searchParams.get("sequence") || "",
    termId: searchParams.get("term") || "",
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
  });

  // ==========================================
  // ETAT DES NOTES (Saisie en cours)
  // ==========================================
  // Structure: 
  // Sequence Mode: { studentEnrollmentId: "15" }
  // Skill Mode: { studentEnrollmentId: { skillId: "12" } }
  const [marks, setMarks] = useState({});
  const [draftExists, setDraftExists] = useState(false);

  // ==========================================
  // DERIVES ET MEMOIZATION
  // ==========================================
  const selectedAssignment = useMemo(
    () => metaData.assignments.find((a) => String(a.id) === String(filters.assignmentId)),
    [metaData.assignments, filters.assignmentId]
  );

  const evaluationMode = selectedAssignment?.school?.evaluation_type || "sequence";
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


  // ==========================================
  // CHARGEMENT INITIAL DES META-DONNEES
  // ==========================================
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchInitialData = async () => {
      try {
        const [assignmentsRes, sequencesRes, termsRes] = await Promise.all([
          axiosClient.get(`/teachers/${user.id}/assignments`),
          axiosClient.get("/sequences"),
          axiosClient.get("/terms"),
        ]);

        setMetaData({
          assignments: assignmentsRes.data.data || [],
          sequences: sequencesRes.data.data || sequencesRes.data || [],
          terms: termsRes.data.data || termsRes.data || [],
          loading: false,
        });
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
    }
  };

  const resetGrid = useCallback(() => {
    setGridData({ students: [], skills: [], loading: false, saving: false, isLoaded: false, activeDraftKey: null });
    setMarks({});
    setDraftExists(false);
  }, []);

  // Nettoyage de la grille si on change la période (Séquence/Trimestre)
  useEffect(() => {
    resetGrid();
  }, [filters.sequenceId, filters.termId, resetGrid]);


  // ==========================================
  // CHARGEMENT DE LA GRILLE (API)
  // ==========================================
  const loadGrid = async () => {
    if (!selectedAssignment) return toast.warning("Sélectionnez une affectation.");
    if (isSequenceMode && !filters.sequenceId) return toast.warning("Sélectionnez une séquence.");
    if (isCompetenceMode && !filters.termId) return toast.warning("Sélectionnez un trimestre.");

    setGridData((prev) => ({ ...prev, loading: true, isLoaded: false }));

    try {
      const endpoint = isSequenceMode ? "/sequence-marks/load" : "/skill-marks/load";
      const params = {
        classroom_id: selectedAssignment.classroom_id,
        subject_id: selectedAssignment.subject_id,
        school_id: selectedAssignment.school_id,
        ...(isSequenceMode ? { sequence_id: filters.sequenceId } : { term_id: filters.termId }),
      };

      const { data } = await axiosClient.get(endpoint, { params });
      const payload = data.data || data;
      
      const loadedStudents = payload.students || [];
      const loadedSkills = payload.skills || [];

      // Initialisation de la compétence active pour le mobile
      if (isCompetenceMode && loadedSkills.length > 0) {
        updateFilter("activeSkillId", String(loadedSkills[0].id));
      }

      // Traitement du brouillon local
      const savedDraft = draftKey ? localStorage.getItem(draftKey) : null;
      const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;
      setDraftExists(!!parsedDraft);

      // Constitution du dictionnaire des notes (Fusion BD + Brouillon)
      const initialMarks = {};

      if (isSequenceMode) {
        loadedStudents.forEach((student) => {
          const dbValue = (student.mark !== null && student.mark !== undefined) ? String(student.mark) : "";
          initialMarks[student.student_enrollment_id] = parsedDraft?.[student.student_enrollment_id] ?? dbValue;
        });
      } else {
        loadedStudents.forEach((student) => {
          const studentDraft = parsedDraft?.[student.student_enrollment_id] || {};
          const dbMarks = {};
          
          if (Array.isArray(student.marks)) {
            student.marks.forEach((m) => {
              dbMarks[m.skill_id] = (m.mark !== null && m.mark !== undefined) ? String(m.mark) : "";
            });
          }

          const finalStudentMarks = {};
          loadedSkills.forEach((skill) => {
            finalStudentMarks[skill.id] = studentDraft[skill.id] ?? dbMarks[skill.id] ?? "";
          });
          initialMarks[student.student_enrollment_id] = finalStudentMarks;
        });
      }

      setMarks(initialMarks);
      setGridData({ students: loadedStudents, skills: loadedSkills, loading: false, saving: false, isLoaded: true, activeDraftKey: draftKey });
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du chargement de la grille.");
      setGridData((prev) => ({ ...prev, loading: false }));
    }
  };


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
    if (gridData.isLoaded && gridData.activeDraftKey) {
      // Sauvegarde automatique strictement liée à la grille active
      localStorage.setItem(gridData.activeDraftKey, JSON.stringify(marks));
      setDraftExists(true);
    }
  }, [marks, gridData.isLoaded, gridData.activeDraftKey]);

  const clearDraft = useCallback(() => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
      setDraftExists(false);
      loadGrid(); // Recharger depuis la base de données
      toast.success("Brouillon effacé, notes restaurées depuis le serveur.");
    }
  }, [draftKey]);


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

      await axiosClient.post(endpoint, payload);
      
      // Nettoyage après succès
      if (draftKey) localStorage.removeItem(draftKey);
      setDraftExists(false);
      
      toast.success("Toutes les notes ont été enregistrées avec succès !");
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de l'enregistrement des notes.");
      console.error(error);
    } finally {
      setGridData((prev) => ({ ...prev, saving: false }));
    }
  };


  // ==========================================
  // CALCULS STATISTIQUES (Progression)
  // ==========================================
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
    <main className="min-h-screen bg-base-100 pb-28">
      <PageHeader
        title="Saisie des notes"
        subtitle="Gérez les évaluations de vos classes avec sauvegarde automatique"
      />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* === PANNEAU DE CONFIGURATION === */}
        <section className="rounded-md bg-base-200 p-5">
          <div className="grid gap-5 md:grid-cols-4 items-end">

            <div className="md:col-span-1">
              <label className="text-xs font-medium text-base-content/60 mb-2 block">
                Affectation (Classe / Matière)
              </label>
              <select
                className="w-full rounded-md bg-base-100 p-3 text-sm outline-none"
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
                  className="w-full rounded-md bg-base-100 p-3 text-sm outline-none"
                  value={filters.sequenceId}
                  onChange={(e) => updateFilter("sequenceId", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {metaData.sequences.map((seq) => (
                    <option key={seq.id} value={seq.id}>{seq.name} ({seq.term?.name})</option>
                  ))}
                </select>
              </div>
            )}

            {isCompetenceMode && (
              <div className="md:col-span-1">
                <label className="text-xs font-medium text-base-content/60 mb-2 block">Trimestre</label>
                <select
                  className="w-full rounded-md bg-base-100 p-3 text-sm outline-none"
                  value={filters.termId}
                  onChange={(e) => updateFilter("termId", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {metaData.terms.map((term) => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-1">
              <button
                type="button"
                onClick={loadGrid}
                disabled={gridData.loading}
                className="w-full rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {gridData.loading ? (
                  <span>Chargement...</span>
                ) : (
                  <>Générer la grille <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </div>

          {/* Indicateur de brouillon local */}
          {draftExists && gridData.isLoaded && (
            <div className="mt-5 flex flex-wrap gap-4 items-center justify-between rounded-md bg-warning/10 p-4 text-sm">
              <div className="flex items-center gap-3 text-base-content/80">
                <AlertCircle size={18} className="text-warning" />
                <span>
                  <strong>Brouillon non enregistré</strong> en base de données. Vos saisies sont gardées localement.
                </span>
              </div>
              <button onClick={clearDraft} className="text-warning hover:brightness-90 font-medium text-xs flex items-center gap-1.5 bg-warning/10 px-3 py-1.5 rounded-sm transition-colors duration-150">
                <Trash2 size={14} /> Restaurer B.D
              </button>
            </div>
          )}
        </section>


        {/* === ZONE DE SAISIE === */}
        {gridData.isLoaded && (
          <section className="rounded-md bg-base-200 overflow-hidden relative flex flex-col">

            {/* Header de la zone */}
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-semibold text-base-content flex items-center gap-2">
                  Grille d'évaluation
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-sm">
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
                    className="w-full rounded-md bg-base-100 p-2.5 text-sm outline-none"
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
                      className={`rounded-md p-4
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
                            : filters.activeSkillName || "Note /20"}
                        </label>

                        {isSequenceMode ? (

                          <input
                            type="text"
                            inputMode="decimal"
                            value={marks[stId] ?? ""}
                            onChange={(e) =>
                              handleSetMark(stId, e.target.value)
                            }
                            disabled={gridData.saving}
                            className="w-full rounded-md bg-base-200 px-4 py-3 text-center text-lg font-semibold outline-none disabled:opacity-50"
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
                              !filters.activeSkillId
                            }
                            className="w-full rounded-md bg-base-200 px-4 py-3 text-center text-lg font-semibold outline-none disabled:opacity-50"
                            placeholder="0 - 20"
                          />

                        )}

                      </div>

                    </div>

                  );

                })}

              </div>

              {/* ================= DESKTOP ================= */}

              <div className="hidden md:block overflow-x-auto w-full">

                <table className="w-full text-left text-sm border-collapse min-w-[600px]">

                  {/* EN-TETES */}
                  <thead>
                    <tr>
                      <th className="p-4 font-medium text-base-content/70 sticky left-0 z-10 bg-base-300 min-w-[250px]">
                        Élève
                      </th>

                      {isSequenceMode && (
                        <th className="p-4 font-medium text-base-content/70 text-center w-40">
                          Note / 20
                        </th>
                      )}

                      {/* Desktop : Affichage de toutes les compétences en colonnes */}
                      {isCompetenceMode && gridData.skills.map(skill => (
                        <th key={skill.id} className="p-4 text-xs font-normal text-base-content/70 text-center min-w-[140px] hidden md:table-cell">
                          <div className="truncate max-w-[150px] mx-auto" title={skill.name}>
                            {skill.name}
                          </div>
                        </th>
                      ))}

                      {/* Mobile : Colonne unique pour la compétence active */}
                      {isCompetenceMode && (
                        <th className="p-4 font-medium text-base-content/70 text-center md:hidden w-32">
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
                        <tr key={stId} className={`transition-colors duration-150 hover:bg-base-300 ${idx % 2 === 1 ? 'bg-zebra' : ''}`}>
                          {/* Cellule Élève fixe */}
                          <td className="p-4 sticky left-0 z-10 bg-base-200">
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
                                disabled={gridData.saving}
                                className="w-24 text-center rounded-md bg-base-100 px-3 py-2.5 text-sm font-medium text-base-content outline-none disabled:opacity-50"
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
                                disabled={gridData.saving}
                                className="w-20 mx-auto block text-center rounded-md bg-base-100 px-2 py-2.5 text-sm font-medium text-base-content outline-none disabled:opacity-50"
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
                                disabled={gridData.saving || !filters.activeSkillId}
                                className="w-24 text-center rounded-md bg-base-100 px-3 py-2.5 text-sm font-medium text-base-content outline-none disabled:opacity-50"
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-200 p-4">
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
                  className={`h-full transition-all duration-300 rounded-sm ${completionStats.percentage === 100 ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${completionStats.percentage}%` }}
                />
              </div>
            </div>

            {/* Bouton de sauvegarde final */}
            <button
              onClick={saveMarksToServer}
              disabled={gridData.saving}
              className="w-full sm:w-auto px-8 py-3 bg-success text-white font-medium text-sm rounded-md transition-colors duration-150 hover:brightness-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {gridData.saving ? "Enregistrement en cours..." : "Enregistrer dans la base"}
            </button>

          </div>
        </div>
      )}

    </main>
  );
}