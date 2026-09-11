import { useEffect, useRef, useState } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/AxiosClient";
import { toast } from "sonner";
import LoadingSkeletoon from "../components/LoadingSkeletoon";
import { useAnimations } from "../utils/animations";
import { Card5 } from "../components/ui/CardsComponents";
import { CtaDark } from "../components/ui/ButtonsComponents";
import { Table, Th, Tr, TdBody } from "../components/Table";
import { 
  Layers, 
  BookOpen, 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Sliders, 
  Info, 
  HelpCircle,
  Hash,
  FolderKanban,
  Check
} from "lucide-react";

function ClassroomDetail() {
  const { setNavbarActions } = useOutletContext();
  const { id } = useParams();
  const containerRef = useRef(null);
  const navigate = useNavigate();
  useAnimations(containerRef);

  // États principaux
  const [loading, setLoading] = useState(false);
  const [classroom, setClassroom] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  
  // États d'édition et modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalSubjects, setGlobalSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  
  // Modifications temporaires (Curriculum de la classe)
  const [tempAssignments, setTempAssignments] = useState([]);
  const [saving, setSaving] = useState(false);

  // Charger les détails de la classe et ses matières associées
  const fetchData = async () => {
    setLoading(true);
    try {
      const [classroomRes, subjectsRes] = await Promise.all([
        api.get(`/classrooms/${id}`),
        api.get(`/classrooms/${id}/subjects`)
      ]);
      
      setClassroom(classroomRes.data);
      
      // Formater les matières reçues avec les attributs du pivot
      const formattedSubjects = (subjectsRes.data || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
        coefficient: sub.pivot?.coefficient || 1,
        group: sub.pivot?.group || "Général"
      }));

      setAssignedSubjects(formattedSubjects);
      setTempAssignments(formattedSubjects);
    } catch (err) {
      toast.error("Erreur lors de la récupération des données de la classe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Synchronisation de la barre d'action supérieure
  useEffect(() => {
    setNavbarActions({
      onBack: () => navigate(-1),
      onAdd: () => handleOpenSelectorModal()
    });
    return () => setNavbarActions({});
  }, [setNavbarActions, assignedSubjects]);

  // Ouvrir le modal de sélection des matières globales
  const handleOpenSelectorModal = async () => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await api.get('/subjects');
      setGlobalSubjects(data.data || data);
    } catch (err) {
      toast.error("Impossible de récupérer la liste globale des matières");
    } finally {
      setModalLoading(false);
    }
  };

  // Ajouter une matière globale à la configuration temporaire de la classe
  const handleSelectSubject = (subject) => {
    const alreadyExists = tempAssignments.some(item => item.id === subject.id);
    if (alreadyExists) {
      toast.warning("Cette matière est déjà ajoutée au programme de la classe");
      return;
    }

    setTempAssignments(prev => [
      ...prev,
      {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        coefficient: 1, // Valeur par défaut
        group: "Général" // Groupe par défaut
      }
    ]);
    toast.success(`${subject.name} ajouté au programme`);
  };

  // Mettre à jour un attribut pivot (coefficient ou groupe) en temps réel
  const handleUpdatePivot = (subjectId, field, value) => {
    setTempAssignments(prev => 
      prev.map(item => {
        if (item.id === subjectId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Retirer une matière de la configuration temporaire de la classe
  const handleRemoveSubject = (subjectId) => {
    setTempAssignments(prev => prev.filter(item => item.id !== subjectId));
  };

  // Envoyer la configuration complète au backend (syncSubjects)
  const handleSaveCurriculum = async () => {
    // Validation rapide côté client
    const hasInvalidCoeff = tempAssignments.some(sub => !sub.coefficient || sub.coefficient <= 0);
    if (hasInvalidCoeff) {
      toast.error("Veuillez renseigner des coefficients valides supérieurs à 0 pour toutes les matières.");
      return;
    }

    setSaving(true);
    try {
      // Préparation du payload attendu par notre syncSubjects du ClassroomController
      const payload = {
        subjects: tempAssignments.map(sub => ({
          id: sub.id,
          coefficient: parseFloat(sub.coefficient),
          group: sub.group || "Général"
        }))
      };

      await api.post(`/classrooms/${id}/subjects`, payload);
      toast.success("Le programme d'enseignement et les coefficients ont été mis à jour !");
      
      // Recharger les données propres du serveur
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement du programme d'enseignement");
    } finally {
      setSaving(false);
    }
  };

  // Filtre de recherche du modal
  const filteredGlobalSubjects = globalSubjects.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcul du total des coefficients pour l'affichage statistique
  const totalCoefficients = tempAssignments.reduce((sum, sub) => sum + (parseFloat(sub.coefficient) || 0), 0);

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* HEADER CONTEXTUEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-200 p-6 rounded-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-md">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-sm">
              Détails de la Structure
            </span>
            <h1 className="text-lg font-semibold text-base-content mt-1.5">
              {classroom ? classroom.name : "Chargement..."}
            </h1>
            <p className="text-xs text-base-content/50 mt-0.5">
              Code : {classroom?.short_name || "N/A"} • Niveau d'index : {classroom?.level_index || "N/A"} • Cycle : {classroom?.cycle || "N/A"}
            </p>
          </div>
        </div>

        {/* STATS RAPIDES */}
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

      {/* ZONE DE CONFIGURATION PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE D'INFORMATIONS COMPLÉMENTAIRES */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-200 p-6 rounded-md space-y-4">
            <h3 className="text-xs font-semibold text-base-content/50">Guide de Configuration</h3>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Sur cet espace, vous pouvez configurer l'ensemble des matières qui composent l'évaluation de cette classe.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-base-content/70">
                <div className="p-1.5 bg-primary/10 text-primary rounded-md mt-0.5">
                  <Hash size={14} />
                </div>
                <span>Le <strong>Coefficient</strong> détermine le poids relatif de la matière dans le calcul des moyennes trimestrielles et annuelles.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-base-content/70">
                <div className="p-1.5 bg-success/10 text-success rounded-md mt-0.5">
                  <FolderKanban size={14} />
                </div>
                <span>Le <strong>Groupe</strong> permet d'organiser les matières sur le bulletin imprimé (ex: *Matières Scientifiques*, *Matières Littéraires*).</span>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 rounded-md p-5 flex gap-3">
            <Info className="text-warning shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-base-content/70 leading-relaxed">
              <strong>Rappel :</strong> Les modifications effectuées ci-dessous ne seront effectives qu'après avoir cliqué sur le bouton d'enregistrement général en bas de tableau.
            </p>
          </div>
        </div>

        {/* TABLEAU DES COEFFICIENTS ET CONFIGURATIONS */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <LoadingSkeletoon />
          ) : tempAssignments.length === 0 ? (
            <div>
              <Card5 icon={BookOpen}>
                <p className="mb-4">Aucune matière n'est configurée pour cette classe.</p>
                <button
                  onClick={handleOpenSelectorModal}
                  className="px-4 py-2.5 bg-primary hover:brightness-95 text-white text-sm font-medium rounded-md transition-colors duration-150 flex items-center gap-2 mx-auto"
                >
                  <Plus size={14} /> Ajouter une matière globale
                </button>
              </Card5>
            </div>
          ) : (
            <div className="bg-base-200 rounded-md overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sliders className="text-primary" size={16} />
                  <h2 className="text-sm font-semibold text-base-content">Programme d'Enseignement Actif</h2>
                </div>
                <span className="text-xs bg-base-300 text-base-content/60 font-medium px-2.5 py-1 rounded-sm">
                  {tempAssignments.length} matière(s) liée(s)
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
                      {/* Discipline / Nom */}
                      <TdBody>
                        <span className="block font-medium text-base-content">{assignment.name}</span>
                        <span className="text-xs bg-base-300 text-base-content/60 px-1.5 py-0.5 rounded-sm mt-1 inline-block">
                          {assignment.code}
                        </span>
                      </TdBody>

                      {/* Coefficient */}
                      <TdBody>
                        <div className="relative max-w-25">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="50"
                            value={assignment.coefficient}
                            onChange={(e) => handleUpdatePivot(assignment.id, 'coefficient', e.target.value)}
                            className="w-full px-3 py-2 bg-base-100 text-base-content font-medium text-center rounded-md outline-none"
                          />
                        </div>
                      </TdBody>

                      {/* Groupe de bulletin */}
                      <TdBody>
                        <input
                          type="text"
                          placeholder="ex: Scientifique, Littéraire..."
                          value={assignment.group}
                          onChange={(e) => handleUpdatePivot(assignment.id, 'group', e.target.value)}
                          className="w-full px-3 py-2 bg-base-100 text-base-content text-sm rounded-md outline-none"
                        />
                      </TdBody>

                      {/* Supprimer de la liste */}
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

              {/* BARRE D'ACTIONS DU PROGRAMME */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={handleOpenSelectorModal}
                  className="px-4 py-2.5 bg-base-100 hover:bg-base-300 text-base-content text-sm font-medium rounded-md transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Ajouter d'autres matières
                </button>

                <button
                  onClick={handleSaveCurriculum}
                  disabled={saving}
                  className="px-5 py-3 bg-primary hover:brightness-95 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <Save size={15} />
                  {saving ? "Enregistrement..." : "Enregistrer la configuration"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SYSTEM MODAL : ASSOCIER DES MATIÈRES DE LA BIBLIOTHÈQUE GLOBALE */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-base-200 w-full h-full sm:h-auto sm:max-w-xl sm:rounded-md overflow-hidden flex flex-col sm:max-h-[80vh]">

            {/* Header */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-base-content">Bibliothèque de matières</h3>
                  <p className="text-xs text-base-content/50">Ajoutez des matières à cette classe</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-base-300 text-base-content/50 hover:text-base-content rounded-md transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* Note */}
            <div className="bg-primary/10 p-4 flex gap-3 text-sm text-base-content/70">
              <Info className="text-primary shrink-0 mt-0.5" size={16} />
              <p className="leading-relaxed">
                Cliquez sur le bouton d'ajout en face d'une matière globale pour l'ajouter à la classe. Vous pourrez ensuite ajuster son coefficient sur le tableau principal.
              </p>
            </div>

            {/* Recherche */}
            <div className="px-6 py-4">
              <input
                type="text"
                placeholder="Rechercher une matière (nom, code)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-base-100 text-sm rounded-md outline-none"
              />
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {modalLoading ? (
                <LoadingSkeletoon />
              ) : filteredGlobalSubjects.map(subject => {
                const isSelected = tempAssignments.some(item => item.id === subject.id);
                return (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-md flex items-center justify-between ${
                      isSelected ? "bg-base-100 opacity-60" : "bg-base-100"
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium text-base-content">{subject.name}</span>
                      <span className="block text-xs text-primary mt-0.5">
                        CODE : {subject.code}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="text-xs bg-success/10 text-success font-medium px-2.5 py-1.5 rounded-sm flex items-center gap-1.5">
                        <Check size={12} /> Ajouté
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
                <div className="text-center py-6 text-base-content/40 text-sm">
                  Aucune matière disponible en bibliothèque globale.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 flex items-center justify-end">
              <CtaDark onAction={() => setIsModalOpen(false)} icon={X}>
                Fermer
              </CtaDark>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClassroomDetail;