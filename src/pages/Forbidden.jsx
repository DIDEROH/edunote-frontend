import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  HomeIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

function Forbidden() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-base-100 flex items-center justify-center px-6">

      <section className="w-full max-w-xl">

        <div className="rounded-md bg-base-200 p-10 md:p-14 text-center">

          <div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-warning/10 text-warning">
              <ShieldExclamationIcon className="h-7 w-7" />
            </div>

            <span className="mt-5 inline-flex items-center rounded-sm bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
              Accès refusé
            </span>

            <h1 className="mt-5 text-3xl font-semibold text-base-content">
              403
            </h1>

            <h2 className="mt-2 text-base font-medium text-base-content">
              Vous n'avez pas les autorisations nécessaires
            </h2>

            <p className="mt-4 text-sm leading-6 text-base-content/60 max-w-md mx-auto">
              Cette ressource est protégée. Vous ne disposez pas des droits
              nécessaires pour accéder à cette page ou effectuer cette
              opération.
            </p>

          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">

            <button
              onClick={() => navigate('/')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-base-100 px-6 py-3 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-warning px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
            >
              <HomeIcon className="w-4 h-4" />
              Retour à l'accueil
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Forbidden;
