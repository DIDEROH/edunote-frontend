import { Hourglass } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Admin from "../../pages/dashboard/Admin";
import Director from "../../pages/dashboard/Director";
import TeacherMarkHub from "../../pages/Teachers/TeacherMarkHub";
import LoadingSkeleton from "../LoadingSkeletoon";

const DashboardHome = () => {
  const { hasRole, loading, userName } = useAuth();

  // On attend que le contexte ait fini de charger les rôles
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (hasRole("admin")) return <Admin />;
  // Directeur et modérateurs : tableau de bord de leur établissement
  if (hasRole("director") || hasRole("moderator")) return <Director />;
  if (hasRole("teacher")) return <TeacherMarkHub />;

  // Compte sans rôle exploitable (ex. inscription récente en attente de validation)
  return (
    <div className="mx-auto max-w-xl rounded-md bg-base-200 p-8 md:p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Hourglass size={26} />
      </div>
      <h1 className="mt-5 text-lg font-semibold text-base-content">
        Bienvenue{userName ? `, ${userName}` : ""}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-base-content/60">
        Votre compte n'est rattaché à aucun établissement. Ouvrez le lien
        d'invitation envoyé par votre établissement, ou inscrivez votre propre
        établissement si vous en êtes le chef.
      </p>
    </div>
  );
};

export default DashboardHome;
