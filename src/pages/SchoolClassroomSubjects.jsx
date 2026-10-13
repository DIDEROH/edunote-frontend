import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Check, Copy, FolderKanban, Hash, Info, Layers, Plus, Save, Sliders, Trash2, X } from "lucide-react";
import { api } from "../utils/AxiosClient";
import { useAuth } from "../context/AuthContext";
import useShowConfirm from "../hooks/UseShowConfirm";
import useNavbarRefresh from "../hooks/useNavbarRefresh";
import { useConfirm } from "../providers/ConfirmProvider";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import { Card5 } from "../components/ui/CardsComponents";
import { CtaDark } from "../components/ui/ButtonsComponents";
import { Table, Th, Tr, TdBody } from "../components/Table";

/**
 * Programme d'une classe POUR UN ÉTABLISSEMENT : matières enseignées,
 * coefficients et groupes. Chaque école configure ses propres classes ;
 * les autres écoles qui utilisent la même classe ne sont pas concernées.
 *
 * Routes : /schools/:schoolId/classrooms/:classroomId (admin)
 *          /my-classes/:classroomId (directeur, son école)
 */
const toAssignment = (subject) => ({
  id: subject.id,
  name: subject.name,
  code: subject.code,
  coefficient: subject.pivot?.coefficient ?? 1,
  group: subject.pivot?.group || "Général",
});

// Comparaison du programme affiché avec celui enregistré (modifications en attente)
const signature = (assignments) =>
  JSON.stringify(assignments.map((item) => [item.id, String(item.coefficient), item.group || ""]));

// Classe, son programme dans l'école, autres classes de l'école (copie) et nom de l'école (admin)
async function fetchProgramme(classroomId, schoolId, withSchoolName) {
  const [classroomRes, subjectsRes, classroomsRes, schoolRes] = await Promise.all([
    api.get(`/classrooms/${classroomId}`),
    api.get(`/classrooms/${classroomId}/subjects`, { params: { school_id: schoolId } }),
    api.get(`/schools/${schoolId}/classrooms`),
    withSchoolName ? api.get(`/schools/${schoolId}`) : Promise.resolve(null),
  ]);

  return {
    classroom: classroomRes.data,
    assignments: (subjectsRes.data || []).map(toAssignment),
    schoolClassrooms: (classroomsRes.data || []).filter((c) => String(c.id) !== String(classroomId)),
    schoolName: schoolRes ? schoolRes.data?.name || "" : null,
  };
}

function SchoolClassroomSubjects() {
  const { setNavbarActions } = useOutletContext();
  const { schoolId: schoolIdParam, classroomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const showConfirm = useShowConfirm();
  const confirm = useConfirm();

  // Admin : école de l'URL ; directeur : son école
  const schoolId = schoolIdParam || user?.school?.id;

  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState(null);
  const [schoolName, setSchoolName] = useState(schoolIdParam ? "" : user?.school?.name || "");
  const [tempAssignments, setTempAssignments] = useState([]);
  // Programme tel qu'enregistré sur le serveur (pour repérer les modifications en attente)
  const [savedAssignments, setSavedAssignments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Bibliothèque des matières (modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalSubjects, setGlobalSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Copie depuis une autre classe de l'école
  const [schoolClassrooms, setSchoolClassrooms] = useState([]);
  const [copySourceId, setCopySourceId] = useState("");

  // keepEdits : le programme modifié à l'écran (non enregistré) est conservé
  const applyProgramme = useCallback((programme, keepEdits = false) => {
    setClassroom(programme.classroom);
    setSchoolClassrooms(programme.schoolClassrooms);
    if (programme.schoolName !== null) setSchoolName(programme.schoolName);
    setSavedAssignments(programme.assignments);
    if (!keepEdits) setTempAssignments(programme.assignments);
  }, []);

  // Chargement de la classe et de SON programme dans cette école
  useEffect(() => {
    if (!schoolId) return;
    let ignore = false;

    fetchProgramme(classroomId, schoolId, Boolean(schoolIdParam))
      .then((programme) => { if (!ignore) applyProgramme(programme); })
      .catch((error) => toast.error(error.message))
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [classroomId, schoolId, schoolIdParam, reloadKey, applyProgramme]);

  const hasPendingChanges = signature(tempAssignments) !== signature(savedAssignments);

  // Actualiser : les modifications non enregistrées ne sont remplacées qu'après confirmation
  useNavbarRefresh(schoolId ? async () => {
    const programme = await fetchProgramme(classroomId, schoolId, Boolean(schoolIdParam));
    const replace = !hasPendingChanges || await confirm(
      "Le programme modifié à l'écran n'est pas encore enregistré. Le remplacer par celui enregistré sur le serveur ?",
      { title: "Actualiser le programme" }
    );
    applyProgramme(programme, !replace);
  } : null);

  const openLibrary = async () => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await api.get("/subjects");
      setGlobalSubjects(data.data || data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    setNavbarActions({
      onBack: () => navigate(-1),
      onAdd: () => openLibrary(),
    });
    return () => setNavbarActions({});
  }, [setNavbarActions, navigate]);

  const handleSelectSubject = (subject) => {
    if (tempAssignments.some((item) => item.id === subject.id)) {
      toast.warning("Cette matière est déjà au programme de la classe");
      return;
    }
    setTempAssignments((prev) => [...prev, { id: subject.id, name: subject.name, code: subject.code, coefficient: 1, group: "Général" }]);
    toast.success(`${subject.name} ajoutée au programme`);
  };

  const handleUpdatePivot = (subjectId, field, value) => {
    setTempAssignments((prev) => prev.map((item) => (item.id === subjectId ? { ...item, [field]: value } : item)));
  };

  const handleRemoveSubject = (subjectId) => {
    setTempAssignments((prev) => prev.filter((item) => item.id !== subjectId));
  };

  // Reprend les matières et coefficients d'une autre classe de l'école (à enregistrer ensuite)
  const handleCopyFrom = () => {
    const source = schoolClassrooms.find((c) => String(c.id) === String(copySourceId));
    if (!source) return;

    const copy = async () => {
      try {
        const { data } = await api.get(`/classrooms/${source.id}/subjects`, { params: { school_id: schoolId } });
        if (!data?.length) {
          toast.info(`La classe « ${source.name} » n'a encore aucune matière configurée.`);
          return;
        }
        setTempAssignments(data.map(toAssignment));
        toast.success(`Programme de « ${source.name} » repris : vérifiez puis enregistrez.`);
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (tempAssignments.length > 0) {
      showConfirm({
        title: "Remplacer le programme",
        message: `Le programme actuel de cette classe sera remplacé par celui de « ${source.name} » (rien n'est enregistré tant que vous ne validez pas).`,
        onSuccess: copy,
      });
    } else {
      copy();
    }
  };

  const handleSave = async () => {
    if (tempAssignments.some((sub) => !sub.coefficient || Number(sub.coefficient) <= 0)) {
      toast.error("Veuillez renseigner des coefficients valides supérieurs à 0 pour toutes les matières.");
      return;
    }

    setSaving(true);
    try {
      await api.post(`/classrooms/${classroomId}/subjects`, {
        school_id: schoolId,
        subjects: tempAssignments.map((sub) => ({
          id: sub.id,
          coefficient: parseFloat(sub.coefficient),
          group: sub.group || "Général",
        })),
      });
      toast.success("Le programme et les coefficients de la classe ont été enregistrés.");
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredGlobalSubjects = globalSubjects.filter((sub) =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalCoefficients = tempAssignments.reduce((sum, sub) => sum + (parseFloat(sub.coefficient) || 0), 0);

  if (!schoolId) {
    return <Card5 icon={Layers}>Aucun établissement ne vous est affecté pour l'année en cours.</Card5>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-200 p-6 rounded-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-md">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-sm">
              {schoolName || "Établissement"}
            </span>
            <h1 className="text-lg font-semibold text-base-content mt-1.5">
              {classroom ? classroom.name : "Chargement..."}
            </h1>
            <p className="text-xs text-base-content/50 mt-0.5">
              Code : {classroom?.short_name || "N/A"} • Niveau : {classroom?.level_index || "N/A"} • Cycle : {classroom?.cycle || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-base-100 p-4 rounded-md text-center min-w-25">
            <span className="block text-lg font-semibold text-base-content">{tempAssignments.length}</span>
            <span className="text-xs text-base-content/50">Matières</span>
          </div>
          <div className="bg-base-100 p-4 rounded-md text-center min-w-25">
            <span className="block text-lg font-semibold text-primary">{totalCoefficients}</span>
            <span className="text-xs text-base-content/50">Total Coeff</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* GUIDE ET COPIE */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-200 p-6 rounded-md space-y-4">
            <h3 className="text-xs font-semibold text-base-content/50">Programme de votre établissement</h3>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Les matières et coefficients définis ici ne concernent que <strong>{schoolName || "cet établissement"}</strong>.
              Les autres écoles qui utilisent la même classe gardent leur propre programme.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-base-content/70">
                <div className="p-1.5 bg-primary/10 text-primary rounded-md mt-0.5">
                  <Hash size={14} />
                </div>
                <span>Le <strong>Coefficient</strong> détermine le poids de la matière dans les moyennes trimestrielles et annuelles.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-base-content/70">
                <div className="p-1.5 bg-success/10 text-success rounded-md mt-0.5">
                  <FolderKanban size={14} />
                </div>
                <span>Le <strong>Groupe</strong> organise les matières sur le bulletin (ex : Matières scientifiques, Matières littéraires).</span>
              </div>
            </div>
          </div>

          {schoolClassrooms.length > 0 && (
            <div className="bg-base-200 p-6 rounded-md space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-base-content/50">
                <Copy size={14} /> Reprendre le programme d'une autre classe
              </h3>
              <select
                value={copySourceId}
                onChange={(e) => setCopySourceId(e.target.value)}
                className="w-full rounded-md bg-base-100 px-4 py-2.5 text-sm outline-none"
              >
                <option value="">Choisir une classe de l'établissement...</option>
                {schoolClassrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button
                type="button"
                onClick={handleCopyFrom}
                disabled={!copySourceId}
                className="w-full rounded-md bg-base-100 px-4 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reprendre ce programme
              </button>
            </div>
          )}

          <div className="bg-warning/10 rounded-md p-5 flex gap-3">
            <Info className="text-warning shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-base-content/70 leading-relaxed">
              <strong>Rappel :</strong> les modifications ne sont prises en compte qu'après avoir cliqué sur « Enregistrer la configuration ».
            </p>
          </div>
        </div>

        {/* TABLEAU DES MATIÈRES */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <LoadingSkeletoon />
          ) : tempAssignments.length === 0 ? (
            <Card5 icon={BookOpen}>
              <p className="mb-4">Aucune matière n'est encore configurée pour cette classe dans votre établissement.</p>
              <button
                onClick={openLibrary}
                className="px-4 py-2.5 bg-primary hover:brightness-95 text-white text-sm font-medium rounded-md transition-colors duration-150 flex items-center gap-2 mx-auto"
              >
                <Plus size={14} /> Ajouter des matières
              </button>
            </Card5>
          ) : (
            <div className="bg-base-200 rounded-md overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sliders className="text-primary" size={16} />
                  <h2 className="text-sm font-semibold text-base-content">Matières enseignées</h2>
                </div>
                <span className="text-xs bg-base-300 text-base-content/60 font-medium px-2.5 py-1 rounded-sm">
                  {tempAssignments.length} matière(s)
                </span>
              </div>

              <Table>
                <Table.Head>
                  <Th>Discipline</Th>
                  <Th>Coefficient</Th>
                  <Th>Groupe de Bulletin</Th>
                  <Th>Actions</Th>
                </Table.Head>
                <Table.Body>
                  {tempAssignments.map((assignment) => (
                    <Tr key={assignment.id}>
                      <TdBody>
                        <span className="block font-medium text-base-content">{assignment.name}</span>
                        <span className="text-xs bg-base-300 text-base-content/60 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
                          {assignment.code}
                        </span>
                      </TdBody>
                      <TdBody>
                        <div className="relative max-w-25">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="50"
                            value={assignment.coefficient}
                            onChange={(e) => handleUpdatePivot(assignment.id, "coefficient", e.target.value)}
                            className="w-full px-3 py-2 bg-base-100 text-base-content font-medium text-center rounded-md outline-none"
                          />
                        </div>
                      </TdBody>
                      <TdBody>
                        <input
                          type="text"
                          placeholder="ex: Scientifique, Littéraire..."
                          value={assignment.group}
                          onChange={(e) => handleUpdatePivot(assignment.id, "group", e.target.value)}
                          className="w-full px-3 py-2 bg-base-100 text-base-content text-sm rounded-md outline-none"
                        />
                      </TdBody>
                      <TdBody>
                        <button
                          onClick={() => handleRemoveSubject(assignment.id)}
                          className="p-2.5 text-base-content/40 hover:text-error rounded-md transition-colors duration-150"
                          title="Retirer cette matière"
                        >
                          <Trash2 size={15} />
                        </button>
                      </TdBody>
                    </Tr>
                  ))}
                </Table.Body>
              </Table>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={openLibrary}
                  className="px-4 py-2.5 bg-base-100 hover:bg-base-300 text-base-content text-sm font-medium rounded-md transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Ajouter d'autres matières
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-3 bg-primary hover:brightness-95 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <Save size={15} />
                  {saving ? "Enregistrement..." : "Enregistrer la configuration"}
                </button>
              </div>
            </div>
          )}

          {/* Enregistrer aussi quand on vient de vider le programme ou de reprendre celui d'une autre classe */}
          {!loading && tempAssignments.length === 0 && (
            <p className="text-center text-xs text-base-content/50">
              Une classe sans matière n'apparaîtra sur aucun bulletin.
            </p>
          )}
        </div>
      </div>

      {/* BIBLIOTHÈQUE DES MATIÈRES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-base-200 w-full h-full sm:h-auto sm:max-w-xl sm:rounded-md overflow-hidden flex flex-col sm:max-h-[80vh]">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-base-content">Bibliothèque de matières</h3>
                  <p className="text-xs text-base-content/50">Ajoutez les matières enseignées dans cette classe</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-base-300 text-base-content/50 hover:text-base-content rounded-md transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-4">
              <input
                type="text"
                placeholder="Rechercher une matière (nom, code)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-base-100 text-sm rounded-md outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
              {modalLoading ? (
                <LoadingSkeletoon />
              ) : filteredGlobalSubjects.map((subject) => {
                const isSelected = tempAssignments.some((item) => item.id === subject.id);
                return (
                  <div key={subject.id} className={`p-4 rounded-md flex items-center justify-between bg-base-100 ${isSelected ? "opacity-60" : ""}`}>
                    <div>
                      <span className="text-sm font-medium text-base-content">{subject.name}</span>
                      <span className="block text-xs text-primary mt-0.5">CODE : {subject.code}</span>
                    </div>
                    {isSelected ? (
                      <span className="text-xs bg-success/10 text-success font-medium px-2.5 py-1.5 rounded-sm flex items-center gap-1.5">
                        <Check size={12} /> Ajoutée
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSubject(subject)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-content text-xs font-medium rounded-sm transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <Plus size={12} /> Ajouter
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredGlobalSubjects.length === 0 && !modalLoading && (
                <div className="text-center py-6 text-base-content/40 text-sm">Aucune matière trouvée.</div>
              )}
            </div>

            <div className="p-6 flex items-center justify-end">
              <CtaDark onAction={() => setIsModalOpen(false)} icon={X}>Fermer</CtaDark>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolClassroomSubjects;
