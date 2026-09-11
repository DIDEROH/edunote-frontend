import {
    FaCalendarAlt,
    FaEnvelope,
    FaUserShield,
    FaUserCircle,
} from "react-icons/fa";

export default function Header({ user, period }) {

    return (
        <div className="rounded-md bg-primary p-6 md:p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                {/* Partie gauche */}
                <div className="flex-1">

                    <span className="inline-flex items-center rounded-sm bg-white/15 px-3 py-1 text-xs font-medium text-white">
                        Tableau de bord Administrateur
                    </span>

                    <h1 className="mt-4 text-lg font-semibold text-white">
                        Bonjour, {user?.first_name}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-white/70">
                        Voici un aperçu complet des statistiques de votre plateforme
                        scolaire. Consultez rapidement les effectifs, les performances
                        et les indicateurs importants.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">

                        <div className="rounded-md bg-white/10 px-4 py-2.5">
                            <div className="text-xs text-white/60">
                                Période
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-white">
                                <FaCalendarAlt className="text-white/60" />
                                {period}
                            </div>
                        </div>

                        <div className="rounded-md bg-white/10 px-4 py-2.5">
                            <div className="text-xs text-white/60">
                                Rôle
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-white">
                                <FaUserShield className="text-white/60" />
                                {user?.roles?.[0]?.name}
                            </div>
                        </div>

                    </div>

                </div>

                {/* Partie droite */}
                <div className="w-full max-w-sm rounded-md bg-base-200 p-5">

                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <FaUserCircle className="text-3xl text-primary" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-base-content">
                                {user?.first_name} {user?.last_name}
                            </h2>

                            <p className="text-xs text-base-content/60 capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3 text-sm">

                        <div className="flex items-center gap-3 text-base-content/70">
                            <FaEnvelope className="text-base-content/40" />
                            <span className="break-all">
                                {user?.email}
                            </span>
                        </div>

                        <div className="flex items-center justify-between rounded-md bg-base-100 p-3">
                            <span className="text-base-content/60">Compte créé</span>

                            <span className="font-medium text-base-content">
                                {new Date(user?.created_at).toLocaleDateString("fr-FR")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between rounded-md bg-base-100 p-3">
                            <span className="text-base-content/60">Email vérifié</span>

                            <span className="font-medium text-success">
                                Oui
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
