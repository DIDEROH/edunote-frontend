import { ShieldAlert } from "lucide-react";
import ErrorScreen from "../components/ui/ErrorScreen";

function Forbidden() {
  return (
    <ErrorScreen
      code="403"
      icon={ShieldAlert}
      title="Vous n'avez pas les autorisations nécessaires"
      text="Cette ressource est protégée. Vous ne disposez pas des droits nécessaires pour accéder à cette page ou effectuer cette opération."
    />
  );
}

export default Forbidden;
