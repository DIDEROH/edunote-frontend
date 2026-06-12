import { Phone, User, Calendar, MapPin, Fingerprint } from "lucide-react";
import { formatDate } from "../utils/FormatDate";

export default function StudentCardComponent({ student }) {
  if (!student) return <div className="italic text-slate-400 p-4">Aucune information disponible</div>;

  return (
    <div className="relative bg-white border border-slate-100 shadow-sm rounded-lg p-6 w-full max-w-sm overflow-hidden group transition-all hover:shadow-md">
      {/* Badge Matricule stylisé */}
      <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-2 rounded-bl-2xl flex items-center gap-2">
        <Fingerprint size={12} className="text-indigo-400" />
        <span className="text-[10px] font-black tracking-widest">{student?.matricule || 'N/A'}</span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header avec Photo/Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 overflow-hidden">
              {student.photo ? (
                <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-indigo-300" />
              )}
            </div>
            {/* Indicateur de Genre */}
            <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl border-2 border-white text-white shadow-sm
              ${student.gender === "M" ? "bg-blue-500" : "bg-pink-500"}`}>
              <span className="text-[10px] font-bold px-1">{student.gender}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-800 leading-tight uppercase tracking-tighter">
              {student.first_name}
            </h3>
            <p className="text-indigo-600 font-bold text-sm uppercase">
              {student.last_name}
            </p>
          </div>
        </div>

        {/* Détails de l'élève */}
        <div className="space-y-3 pt-2 border-t border-slate-50">
          <DetailItem 
            icon={<Calendar size={14} />} 
            label={`Né${student.gender === "F" ? "e" : ""} le`} 
            value={formatDate(student.birth_date)} 
          />
          
          {student.birth_place && (
            <DetailItem 
              icon={<MapPin size={14} />} 
              label="À" 
              value={student.birth_place} 
            />
          )}

          <DetailItem 
            icon={<User size={14} />} 
            label="Genre" 
            value={student.gender === "M" ? "Masculin" : "Féminin"} 
          />
        </div>

        {/* Action Appel */}
        {student.contact && (
          <div className="mt-2 flex items-center justify-between bg-slate-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
              <span className="text-xs font-bold text-slate-700">{student.contact}</span>
            </div>
            <a 
              href={`tel:${student.contact}`} 
              className="p-3 bg-white shadow-sm rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
            >
              <Phone size={16} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Petit composant interne pour la cohérence des lignes
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-slate-400 bg-slate-50 p-1.5 rounded-lg">{icon}</span>
    <div className="flex gap-1 items-baseline">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter w-14">
        {label}
      </span>
      <span className="text-xs font-bold text-slate-700">
        {value}
      </span>
    </div>
  </div>
);