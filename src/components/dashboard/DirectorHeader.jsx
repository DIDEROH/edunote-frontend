import { motion } from "framer-motion";
import {
    FaSchool,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaCalendarAlt,
    FaUserCircle,
    FaGraduationCap,
    FaHashtag,
} from "react-icons/fa";

export default function DirectorHeader({ school, user }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-8 shadow-2xl text-white"
        >
            {/* Glow */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="grid lg:grid-cols-3 gap-8 items-center">
                {/* School */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-5">
                        <div className="h-24 w-24 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center">
                            <FaSchool className="text-5xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black">{school?.name}</h1>
                            <p className="mt-2 text-indigo-100 text-lg">{school?.motto}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid md:grid-cols-2 gap-4">
                        <Info icon={<FaMapMarkerAlt />} label="Ville" value={school?.city} />
                        <Info icon={<FaPhoneAlt />} label="Téléphone" value={school?.phone} />
                        <Info icon={<FaEnvelope />} label="Email" value={school?.email} />
                        <Info icon={<FaHashtag />} label="Code" value={school?.code} />
                        <Info icon={<FaGraduationCap />} label="Evaluation" value={school?.evaluation_type} />
                        <Info 
                            icon={<FaCalendarAlt />} 
                            label="Créé le" 
                            value={new Date(school?.created_at).toLocaleDateString("fr-FR")} 
                        />
                    </div>
                </div>

                {/* Directeur */}
                <div className="rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-6">
                    <div className="flex flex-col items-center">
                        <div className="h-28 w-28 rounded-full bg-white/20 flex items-center justify-center">
                            <FaUserCircle className="text-7xl" />
                        </div>
                        <h2 className="mt-5 text-2xl font-bold">{user?.first_name} {user?.last_name}</h2>
                        <span className='italic semibold'>{user?.email}</span>

                    </div>
                </div> 
            </div>
        </motion.div>
    );
}

function Info({ icon, label, value }) {
    return (
        <div className="flex gap-4 items-center rounded-2xl bg-white/10 p-4 backdrop-blur overflow-clip">
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center text-xl flex-none">
                {icon}
            </div>
            <div>
                <div className="text-sm text-indigo-100">{label}</div>
                <div className="font-semibold">{value}</div>
            </div>
        </div>
    );
}
