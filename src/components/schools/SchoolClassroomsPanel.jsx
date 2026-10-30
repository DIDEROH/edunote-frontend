import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, CheckSquare, Info, Layers, Save, Search, Settings2, Square, X } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import LoadingSkeleton from "../LoadingSkeletoon";
import { CtaDark } from "../ui/ButtonsComponents";

/**
 * Classes d'un établissement : choix des classes dans le catalogue commun,
 * puis accès au programme (matières, coefficients) propre à l'école pour
 * chaque classe. Utilisé par la fiche école (admin) et par « Classes et
 * matières » (directeur).
 *
 * classrooms   : classes de l'école, avec leurs matières pour cette école
 * configurePath: (classroomId) => route de configuration des matières
 */
export default function SchoolClassroomsPanel({ schoolId, classrooms = [], canManage, onChanged, configurePath }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const openPicker = async () => {
    setIsModalOpen(true);
    setModalLoading(true);
    setSelected(classrooms.map((c) => c.id));
    try {
      // Catalogue complet des classes (commun à toutes les écoles)
      const { data } = await api.get("/classrooms", { params: { catalog: 1 } });
      setCatalog(data.data || data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const toggle = (classId) => {
    setSelected((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`/schools/${schoolId}/classrooms`, { classroom_ids: selected });
      toast.success("Les classes de l'établissement ont été mises à jour.");
      setIsModalOpen(false);
      onChanged?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalog = catalog.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const unconfigured = classrooms.filter((c) => !c.subjects?.length).length;

  return (
    <div className="surface p-6">
      <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/8 text-primary rounded-xl ring-1 ring-primary/15">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-base-content">Salles de classe de l'établissement</h2>
            <p className="text-xs text-base-content/50">Chaque classe a ses propres matières et coefficients dans cette école</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="ui-chip bg-base-300 text-base-content/70">
            {classrooms.length} classe(s)
          </span>
          {canManage && (
            <button
              onClick={openPicker}
              className="ui-btn ui-btn-primary ui-btn-sm"
            >
              <Layers size={14} /> Choisir les classes
            </button>
          )}
        </div>
      </div>

      {unconfigured > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-md bg-warning/10 p-4 text-sm text-base-content/70">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-warning" />
          <p>{unconfigured} classe(s) sans matière : leurs bulletins seront vides tant que leurs matières ne sont pas configurées.</p>
        </div>
      )}

      {classrooms.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-md">
          <p className="text-sm text-base-content/50">Aucune salle de classe n'est encore choisie pour cet établissement.</p>
          {canManage && (
            <button
              onClick={openPicker}
              className="mt-3 text-sm text-primary font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              Choisir dans la liste des classes <ArrowRight size={12} />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classrooms.map((classroom) => {
            const subjects = classroom.subjects || [];
            const totalCoef = subjects.reduce((sum, s) => sum + (parseFloat(s.pivot?.coefficient) || 0), 0);

            return (
              <div key={classroom.id} className="p-4 bg-base-100 rounded-xl flex items-center justify-between gap-3 ring-1 ring-base-300/60">
                <div className="min-w-0">
                  <span className="block truncate text-sm font-medium text-base-content">{classroom.name}</span>
                  {subjects.length > 0 ? (
                    <span className="block text-xs text-base-content/50 mt-0.5">
                      {subjects.length} matière(s) • total des coefficients : {totalCoef}
                    </span>
                  ) : (
                    <span className="ui-chip mt-1 bg-warning/10 text-warning">
                      Aucune matière
                    </span>
                  )}
                </div>
                {canManage && (
                  <button
                    onClick={() => navigate(configurePath(classroom.id))}
                    className="ui-btn bg-primary/10 text-primary ui-btn-sm shrink-0 hover:bg-primary/15"
                    title="Configurer les matières et coefficients"
                  >
                    <Settings2 size={14} /> Matières
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CHOIX DES CLASSES DANS LE CATALOGUE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-night/60 backdrop-blur-sm">
          <div className="surface rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-xl overflow-hidden flex flex-col sm:max-h-[85vh]">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/8 text-primary rounded-xl ring-1 ring-primary/15">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-base-content">Choisir les classes</h3>
                  <p className="text-xs text-base-content/50">{selected.length} classe(s) sélectionnée(s)</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="ui-icon-btn ui-icon-btn-sm hover:text-base-content"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-primary/10 p-4 flex gap-3 text-sm text-base-content/70">
              <Info className="text-primary shrink-0 mt-0.5" size={16} />
              <p className="leading-relaxed">
                Cochez les classes ouvertes dans l'établissement. Configurez ensuite, pour chacune, les matières enseignées et leurs coefficients.
                Une classe qui a encore des élèves inscrits cette année ne peut pas être retirée.
              </p>
            </div>

            <div className="px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher une classe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ui-field w-full pl-9 pr-4"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2.5">
              {modalLoading ? (
                <LoadingSkeleton />
              ) : filteredCatalog.map((classroom) => {
                const isSelected = selected.includes(classroom.id);
                return (
                  <div
                    key={classroom.id}
                    onClick={() => toggle(classroom.id)}
                    className={`p-4 rounded-xl ring-1 ring-base-300/60 cursor-pointer flex items-center gap-4 transition-colors duration-150 ${
                      isSelected ? "bg-primary/10" : "bg-base-100 hover:bg-base-300"
                    }`}
                  >
                    <span className={isSelected ? "text-primary" : "text-base-content/30"}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-base-content">{classroom.name}</span>
                      <span className="block text-xs text-base-content/50 mt-0.5">
                        {classroom.cycle} • Niveau {classroom.level_index}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredCatalog.length === 0 && !modalLoading && (
                <div className="text-center py-6 text-base-content/50 text-sm">Aucune classe ne correspond à votre recherche.</div>
              )}
            </div>

            <div className="p-6 flex items-center justify-between gap-4">
              <CtaDark onAction={() => setIsModalOpen(false)} icon={X}>Annuler</CtaDark>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="ui-btn ui-btn-primary"
              >
                <Save size={14} />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
