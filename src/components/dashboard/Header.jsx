import { motion } from "framer-motion";
import {
    FaCalendarAlt,
    FaEnvelope,
    FaUserShield,
    FaUserCircle,
} from "react-icons/fa";

export default function Header({ user, period }) {

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 md:p-8 text-white shadow-2xl"
        >
            {/* Décoration */}
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                {/* Partie gauche */}
                <div className="flex-1">

                    <span className="inline-flex items-center rounded bg-white/15 px-4 py-1 text-sm backdrop-blur">
                        Tableau de bord Administrateur
                    </span>

                    <h1 className="mt-5 text-3xl font-black md:text-5xl">
                        Bonjour, {user?.first_name} 👋
                    </h1>

                    <p className="mt-3 max-w-2xl text-indigo-100">
                        Voici un aperçu complet des statistiques de votre plateforme
                        scolaire. Consultez rapidement les effectifs, les performances
                        et les indicateurs importants.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">

                        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                            <div className="text-xs uppercase tracking-wide text-indigo-200">
                                Période
                            </div>
                            <div className="mt-1 flex items-center gap-2 font-semibold">
                                <FaCalendarAlt />
                                {period}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                            <div className="text-xs uppercase tracking-wide text-indigo-200">
                                Rôle
                            </div>
                            <div className="mt-1 flex items-center gap-2 font-semibold">
                                <FaUserShield />
                                {user?.roles?.[0]?.name}
                            </div>
                        </div>

                    </div>

                </div>

                {/* Partie droite */}
                <div className="w-full max-w-sm rounded-3xl bg-white/10 p-5 backdrop-blur-xl border border-white/20">

                    <div className="flex items-center gap-4">

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                            <FaUserCircle className="text-6xl text-white" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">
                                {user?.first_name} {user?.last_name}
                            </h2>

                            <p className="text-indigo-100 capitalize">
                                {user?.role}
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 space-y-4 text-sm">

                        <div className="flex items-center gap-3">
                            <FaEnvelope className="text-indigo-200" />
                            <span className="break-all">
                                {user?.email}
                            </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                            <span>Compte créé</span>

                            <span className="font-semibold">
                                {new Date(user?.created_at).toLocaleDateString("fr-FR")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                            <span>Email vérifié</span>

                            <span className="font-semibold text-green-300">
                                Oui
                            </span>
                        </div>

                    </div>

                </div>

            </div>

        </motion.div>
    );
}