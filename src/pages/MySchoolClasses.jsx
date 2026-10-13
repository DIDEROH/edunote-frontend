import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import PageHeader from "../components/elements/PageHeader";
import LoadingSkeleton from "../components/LoadingSkeletoon";
import { Card5 } from "../components/ui/CardsComponents";
import SchoolClassroomsPanel from "../components/schools/SchoolClassroomsPanel";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/AxiosClient";
import useNavbarRefresh from "../hooks/useNavbarRefresh";

/**
 * Classes et matières de l'établissement du directeur : il choisit ses
 * classes dans le catalogue, puis configure pour chacune les matières
 * enseignées et leurs coefficients (propres à son école).
 */
function MySchoolClasses() {
  const { user } = useAuth();
  const schoolId = user?.school?.id;

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!schoolId) return;
    let ignore = false;

    api.get(`/schools/${schoolId}`)
      .then(({ data }) => { if (!ignore) setClassrooms(data.classrooms || []); })
      .catch((error) => toast.error(error.message))
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [schoolId, reloadKey]);

  // Actualiser : la liste reste affichée pendant le rechargement
  useNavbarRefresh(schoolId
    ? () => api.get(`/schools/${schoolId}`).then(({ data }) => setClassrooms(data.classrooms || []))
    : null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Classes et matières"
        subtitle={`Choisissez les classes de ${user?.school?.name || "votre établissement"}, puis définissez pour chacune les matières enseignées et leurs coefficients.`}
      />

      {!schoolId ? (
        <Card5 icon={Layers}>Aucun établissement ne vous est affecté pour l'année en cours.</Card5>
      ) : loading ? (
        <LoadingSkeleton />
      ) : (
        <SchoolClassroomsPanel
          schoolId={schoolId}
          classrooms={classrooms}
          canManage
          onChanged={() => setReloadKey((key) => key + 1)}
          configurePath={(classroomId) => `/my-classes/${classroomId}`}
        />
      )}
    </div>
  );
}

export default MySchoolClasses;
