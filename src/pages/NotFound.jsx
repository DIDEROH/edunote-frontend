import { SearchX } from "lucide-react";
import ErrorScreen from "../components/ui/ErrorScreen";

function NotFound() {
  return (
    <ErrorScreen
      code="404"
      icon={SearchX}
      title="Page introuvable"
      text="La page que vous recherchez n'existe plus, a été déplacée ou l'adresse saisie est incorrecte."
    />
  );
}

export default NotFound;
