import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  ArrowLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-base-100 flex items-center justify-center px-6">

      <section className="w-full max-w-xl">

        <div className="rounded-md bg-base-200 p-10 md:p-14 text-center">

          <Logo className="mx-auto w-16 h-16 rounded-md" />

          <div className="mt-8">

            <span className="inline-flex items-center rounded-sm bg-base-300 px-3 py-1 text-xs font-medium text-base-content/60">
              Erreur
            </span>

            <h1 className="mt-5 text-3xl font-semibold text-base-content">
              404
            </h1>

            <h2 className="mt-2 text-base font-medium text-base-content">
              Page introuvable
            </h2>

            <p className="mt-4 text-sm leading-6 text-base-content/60 max-w-md mx-auto">
              La page que vous recherchez n'existe plus, a été déplacée
              ou l'adresse saisie est incorrecte.
            </p>

          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">

            <button
              onClick={() => navigate(-1)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-base-100 px-6 py-3 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Retour
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:brightness-95"
            >
              <HomeIcon className="w-4 h-4" />
              Accueil
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default NotFound;
