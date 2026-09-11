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
        <div className="rounded-md bg-primary p-6 md:p-8">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
                {/* School */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-md bg-white/10 flex items-center justify-center">
                            <FaSchool className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white">{school?.name}</h1>
                            <p className="mt-1 text-sm text-white/70">{school?.motto}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid md:grid-cols-2 gap-3">
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
                <div className="rounded-md bg-base-200 p-5">
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaUserCircle className="text-3xl text-primary" />
                        </div>
                        <h2 className="mt-4 text-sm font-semibold text-base-content">{user?.first_name} {user?.last_name}</h2>
                        <span className="text-xs text-base-content/60">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ icon, label, value }) {
    return (
        <div className="flex gap-3 items-center rounded-md bg-white/10 p-3">
            <div className="h-9 w-9 rounded-md bg-white/10 flex items-center justify-center text-sm text-white flex-none">
                {icon}
            </div>
            <div>
                <div className="text-xs text-white/60">{label}</div>
                <div className="text-sm font-medium text-white">{value}</div>
            </div>
        </div>
    );
}
