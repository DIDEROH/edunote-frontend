import { useEffect, useState, useRef } from "react";
import { Plus, Save, Trash2, GripVertical, Award, Star, RefreshCcw } from "lucide-react";
import { api } from "../utils/AxiosClient";
import { toast } from "sonner";
import PageHeader from "../components/elements/PageHeader";

function SkillsConfig() {
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subjectsResponse, classroomsResponse] = await Promise.all([
          api.get("/subjects"),
          api.get("/classrooms")
        ]);
        // Sécurisation : on s'assure de toujours avoir un tableau
        setSubjects(subjectsResponse?.data || []);
        setClassrooms(classroomsResponse?.data || []);
      } catch (error) {
        toast.error("Erreur de chargement des données");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedSubject || !selectedClassroom) {
      setSkills([]);
      return;
    }
    fetchSkills();
  }, [selectedSubject, selectedClassroom]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/skills?subject_id=${selectedSubject}&classroom_id=${selectedClassroom}`
      );
      setSkills(Array.isArray(response.data) ? response.data : [{ name: "", max_mark: 20, position: 1 }]);
    } catch (error) {
      toast.error("Impossible de récupérer les compétences");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    setSkills((prev) => [
      ...prev,
      { name: "", max_mark: 20, position: prev.length + 1 }
    ]);
  };

  const updateSkill = (index, field, value) => {
    setSkills((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeSkill = (index) => {
    const filtered = skills
      .filter((_, i) => i !== index)
      .map((skill, i) => ({ ...skill, position: i + 1 }));
    setSkills(filtered);
  };

  const saveSkills = async () => {
    if (!selectedSubject || !selectedClassroom) {
      toast.warning("Sélectionnez une matière et une classe");
      return;
    }

    const validSkills = skills
      .filter((skill) => skill.name.trim() !== "")
      .map((skill, index) => ({
        id: skill.id,
        name: skill.name,
        max_mark: Number(skill.max_mark),
        position: index + 1
      }));

    if (!validSkills.length) {
      toast.warning("Ajoutez au moins une compétence");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/skills/bulk", {
        subject_id: selectedSubject,
        classroom_id: selectedClassroom,
        skills: validSkills
      });
      setSkills(data.data);
      toast.success("Compétences enregistrées");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copySkills = [...skills];
      const dragItemContent = copySkills[dragItem.current];
      copySkills.splice(dragItem.current, 1);
      copySkills.splice(dragOverItem.current, 0, dragItemContent);
      setSkills(copySkills.map((s, i) => ({ ...s, position: i + 1 })));
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const currentSubject = subjects?.find((s) => String(s.id) === String(selectedSubject));

  return (
    <main className="min-h-screen bg-base-100">
      <PageHeader />
      <section className="max-w-5xl mx-auto p-3 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <select
            className="flex-1 p-3 rounded-md bg-base-200 text-sm font-medium text-base-content outline-none"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Sélectionnez une matière --</option>
            {(subjects || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            className="flex-1 p-3 rounded-md bg-base-200 text-sm font-medium text-base-content outline-none"
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
          >
            <option value="">-- Sélectionnez une classe --</option>
            {(classrooms || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-base-200 rounded-md overflow-hidden">
          <div className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 text-warning p-3 rounded-md">
                <Award size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-base-content text-base">Compétences</h2>
                <p className="text-xs text-base-content/50">
                  {currentSubject?.name ?? "Aucune matière"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveSkills}
                disabled={!selectedSubject || !selectedClassroom || loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-medium transition-colors duration-150 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer
              </button>
              <button
                onClick={addSkill}
                disabled={!selectedSubject || !selectedClassroom}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary/10 text-primary text-sm font-medium transition-colors duration-150 hover:bg-primary/15 disabled:opacity-50"
              >
                <Plus size={16} />
                Ajouter
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {(skills || []).map((skill, index) => (
              <article
                key={skill.id ?? index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="bg-base-100 rounded-md p-4 transition-colors duration-150 hover:bg-base-300 cursor-move"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GripVertical size={18} className="text-base-content/30" />
                    <span className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center font-semibold text-primary text-sm">{index + 1}</span>
                  </div>
                  <button onClick={() => removeSkill(index)} className="text-base-content/30 hover:text-error transition-colors duration-150">
                    <Trash2 size={18} />
                  </button>
                </div>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(index, "name", e.target.value)}
                  placeholder="Exemple : Résoudre un problème"
                  className="w-full bg-base-200 rounded-md px-4 py-3 text-sm font-medium text-base-content outline-none"
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 bg-base-200 rounded-md px-4 py-2">
                    <Star size={15} className="text-warning" />
                    <input
                      type="number"
                      value={skill.max_mark}
                      onChange={(e) => updateSkill(index, "max_mark", e.target.value)}
                      className="w-14 text-center font-semibold text-sm outline-none"
                    />
                    <span className="text-xs font-medium text-base-content/50">/20</span>
                  </div>
                  {skill.id && <span className="text-xs font-medium text-success">Enregistrée</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default SkillsConfig;