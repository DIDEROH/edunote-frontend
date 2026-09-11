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
      <div className="h-screen flex items-center justify-center bg-base-100">
        <Loading load={true} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-100">
      <PageHeader
        title="Espace enseignant"
        subtitle="Suivez rapidement les grilles de notes que vous pouvez saisir."
      />

      <div className="mt-6">

        {mappedAssignments.length === 0 ? (
          <div className="rounded-md bg-base-200 p-10 text-center text-sm text-base-content/60">
            Vous n'avez aucune affectation active pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mappedAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-md p-5 bg-base-200 flex flex-col items-center text-center">
                <div className="mb-2 text-xs font-medium text-base-content/50 uppercase">{assignment.school}</div>
                <h3 className="text-base font-semibold text-base-content">{assignment.label}</h3>
                <p className="mt-1 text-sm text-base-content/60">{assignment.year}</p>
                <div className="mt-4 flex flex-wrap gap-3">
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
