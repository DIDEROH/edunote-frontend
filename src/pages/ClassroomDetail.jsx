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
    <div ref={containerRef} className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER CONTEXTUEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Layers size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Détails de la Structure
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
              {classroom ? classroom.name : "Chargement..."}
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              Code : {classroom?.short_name || "N/A"} • Niveau d'index : {classroom?.level_index || "N/A"} • Cycle : {classroom?.cycle || "N/A"}
            </p>
          </div>
        </div>

        {/* STATS RAPIDES */}
        <div className="flex gap-4">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center min-w-[100px]">
            <span className="block text-xl font-black text-slate-800">{tempAssignments.length}</span>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Matières</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center min-w-[100px]">
            <span className="block text-xl font-black text-indigo-600">{totalCoefficients}</span>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total Coeff</span>
          </div>
        </div>
      </div>

      {/* ZONE DE CONFIGURATION PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE D'INFORMATIONS COMPLÉMENTAIRES */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Guide de Configuration</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Sur cet espace, vous pouvez configurer l'ensemble des matières qui composent l'évaluation de cette classe.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                  <Hash size={14} />
                </div>
                <span>Le <strong>Coefficient</strong> détermine le poids relatif de la matière dans le calcul des moyennes trimestrielles et annuelles.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                  <FolderKanban size={14} />
                </div>
                <span>Le <strong>Groupe</strong> permet d'organiser les matières sur le bulletin imprimé (ex: *Matières Scientifiques*, *Matières Littéraires*).</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 flex gap-3.5">
            <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-amber-800 leading-relaxed font-semibold">
              <strong>Rappel :</strong> Les modifications effectuées ci-dessous ne seront effectives qu'après avoir cliqué sur le bouton d'enregistrement général en bas de tableau.
            </p>
          </div>
        </div>

        {/* TABLEAU DES COEFFICIENTS ET CONFIGURATIONS */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <LoadingSkeletoon />
          ) : tempAssignments.length === 0 ? (
            <div className="animate-reveal">
              <Card5 icon={BookOpen}>
                <p className="mb-4">Aucune matière n'est configurée pour cette classe.</p>
                <button
                  onClick={handleOpenSelectorModal}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-lg shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus size={14} /> Ajouter une matière globale
                </button>
              </Card5>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden animate-reveal">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sliders className="text-indigo-600" size={18} />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Programme d'Enseignement Actif</h2>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">
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
                        <span className="block font-bold text-slate-800">{assignment.name}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block">
                          {assignment.code}
                        </span>
                      </TdBody>

                      {/* Coefficient */}
                      <TdBody>
                        <div className="relative max-w-[100px]">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="50"
                            value={assignment.coefficient}
                            onChange={(e) => handleUpdatePivot(assignment.id, 'coefficient', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-250 text-slate-800 font-bold text-center rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-250 text-slate-700 font-semibold text-xs rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </TdBody>

                      {/* Supprimer de la liste */}
                      <TdBody>
                        <button
                          onClick={() => handleRemoveSubject(assignment.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
              <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <button
                  onClick={handleOpenSelectorModal}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Ajouter d'autres matières
                </button>
                
                <button
                  onClick={handleSaveCurriculum}
                  disabled={saving}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Bibliothèque de matières</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Ajoutez des matières à cette classe</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Note */}
            <div className="bg-indigo-50/60 p-4 border-b border-indigo-100/20 flex gap-3 text-xs text-indigo-950">
              <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
              <p className="leading-relaxed font-semibold">
                Cliquez sur le bouton d'ajout en face d'une matière globale pour l'ajouter à la classe. Vous pourrez ensuite ajuster son coefficient sur le tableau principal.
              </p>
            </div>

            {/* Recherche */}
            <div className="px-6 py-4 border-b border-slate-50">
              <input
                type="text"
                placeholder="Rechercher une matière (nom, code)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 text-sm font-semibold rounded-lg border border-slate-250 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
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
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected 
                        ? "bg-slate-50 border-slate-200 opacity-60" 
                        : "bg-white border-slate-150 hover:bg-slate-50/50"
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-800">{subject.name}</span>
                      <span className="block text-[9px] text-indigo-600 font-black uppercase mt-0.5 tracking-tight">
                        CODE : {subject.code}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Check size={12} /> Ajouté
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSubject(subject)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Plus size={12} /> Ajouter
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredGlobalSubjects.length === 0 && !modalLoading && (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Aucune matière disponible en bibliothèque globale.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end bg-slate-50">
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