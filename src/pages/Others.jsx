import { useRef } from "react";
import { useAnimations } from "../utils/animations";
import PageHeader from "../components/elements/PageHeader";

function Others() {

    const containerRef = useRef(null);
    useAnimations(containerRef);

  return (
    <div ref={containerRef}>
        <div className="animate-reveal">
          <PageHeader
            title="Autres fonctionnalités"
            subtitle="Gérez les autres fonctionnalités de l'application"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 animate-reveal">Page Others</h1>
    </div>
  )
}

export default Others