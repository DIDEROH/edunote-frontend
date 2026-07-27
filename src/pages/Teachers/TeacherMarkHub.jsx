import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "sonner";
import Loading from "../../components/Loading";
import PageHeader from "../../components/elements/PageHeader";
import { CtaNeon } from "../../components/ui/ButtonsComponents";

function TeacherMarkHub() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`/teachers/${user.id}/assignments`);
      setAssignments(data.data || []);
    } catch (error) {
      toast.error("Impossible de récupérer vos affectations.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadAssignments();
    }
  }, [authLoading, user]);

  const mappedAssignments = useMemo(
    () =>
      assignments.map((assignment) => ({
        id: assignment.id,
        label: `${assignment.classroom?.name || "Classe"} — ${assignment.subject?.name || "Matière"}`,
        school: assignment.school?.name || "École inconnue",
        year: assignment.academic_year?.name || "Année inconnue",
        classroomId: assignment.classroom_id,
        subjectId: assignment.subject_id,
      })),
    [assignments]
  );

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loading load={true} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50">
      <PageHeader
        title="Espace enseignant"
        subtitle="Suivez rapidement les grilles de notes que vous pouvez saisir."
      />

      <div className="mt-8">
        

        {mappedAssignments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            Vous n'avez aucune affectation active pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mappedAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-3xl border border-indigo-300 p-5 bg-gradient-to-br from-indigo-200 to-slate-50 flex flex-col items-center text-center">
                <div className="mb-3 text-sm font-black text-indigo-500 uppercase">{assignment.school}</div>
                <h3 className="text-lg font-bold text-indigo-600">{assignment.label}</h3>
                <p className="mt-2 text-sm text-slate-500">{assignment.year}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <CtaNeon
                    type="button"
                    onAction = {() => window.location.assign(`/marks/entry?assignment=${assignment.id}`)}
                  >
                      Saisir les notes
                  </CtaNeon>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default TeacherMarkHub;
