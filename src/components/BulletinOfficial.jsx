import {formatDate} from "../utils/FormatDate"
import BulletinBottomTable from "./BulletinBottomTable";
import DeviseComponent from "./DeviseComponent";
import Logo from "./Logo";
import SmallStars from "./SmallStars";
import {forwardRef} from 'react'
import SubjectsCompetenciesTable from "./SubjectsCompetenciesTable";
import { User } from "lucide-react";

const BulletinOfficial = forwardRef(({bulletin}, ref) => {
  const tdStyle = "border border-slate-800 p-1 font-bold text-[9px]"
  return (
    <main ref={ref} className="bg-base-100 print:bg-white text-black p-3 w-full max-w-5xl mx-auto text-sm">
      {/* EN-TETE */}
      <header className="flex justify-between mb-2">
        <aside className="flex flex-col items-center text-[10px]">
          <span>REPUBLIQUE DU CAMEROUN</span>
          <DeviseComponent>Paix - Travail - Patrie</DeviseComponent>
          <SmallStars />
          <span>MINISTERE DES ENSEIGNEMENTS SECONDAIRES</span>
          <SmallStars />
          <span>DELEGATION REGIONALE DE L'EST</span>
          <SmallStars />
          <span>DELEGATION DEPARTEMENTALE DU HAUT-NYONG</span>
          <SmallStars />
        </aside>
  
        <aside className="flex items-center flex-col">
          <span className="font-bold">{bulletin?.school_info?.name}</span>
          <span className="capitalize text-[10px] italic">{bulletin?.school_info?.motto}</span>
          <Logo className="w-18" />
          <span className="font-semibold uppercase text-xs">9ex1gsfd110591{bulletin?.school_info?.code}</span>
          <span className="font-black uppercase text-center text-xs">BULLETIN SCOLAIRE DU {bulletin?.term_name}</span>
          <span className="font-semibold text-xs">Année scolaire {bulletin?.academic_year_name}</span>
        </aside>
  
        <aside className="flex flex-col items-center text-[10px]">
          <span>REPUBLIC OF CAMEROON</span>
          <DeviseComponent>Peace - Work - Fatherland</DeviseComponent>
          <SmallStars />
          <span>MINISTRY OF SECONDARY EDUCATION</span>
          <SmallStars />
          <span>EAST REGIONAL DELEGATION</span>
          <SmallStars />
          <span>UPPER-NYONG DIVISIONAL DELEGATION</span>
          <SmallStars />
        </aside>
  
      </header>
  
      {/* CORPS DU BULLETIN */}
      <section>
  
        {/* INFORMATIONS DE L'ELEVE */}
        <aside className="flex mb-2">
  
          <div className="aspect-square h-20 shadow-xl m-2 rounded-xl flex-none flex items-center justify-center overflow-hidden">
            {bulletin?.photo ? <img src={bulletin.photo} className="h-full w-full object-cover object-center" /> : <User size={50} />}
          </div>
  
          <table className="border-collapse border border-slate-400 w-full text-[11px]">
            <tbody>

              <tr>
                <td colSpan={3} className={tdStyle}>
                  Noms et Prénoms de l'élève : <span className="font-bold uppercase text-xs">{bulletin?.student_name}</span>
                </td>
                <td className="border border-slate-800 p-1 font-black">Classe : {bulletin?.class_name} </td>
              </tr>
  
              <tr>
                <td className="border border-slate-800 p-1 h-6 font-medium" colSpan={2}>Date et lieu de naissance :  {formatDate(bulletin?.birth_date)} à {bulletin?.birth_place}</td>
                <td className="border border-slate-800 p-1 font-medium">Genre : {bulletin?.gender === "F" ? "Feminin" : "Masculin"}</td>
                <td className="border border-slate-800 p-1 font-medium">Effectif : <span className="font-black"> {bulletin?.class_stats?.total_students}</span> </td>
              </tr>
  
              <tr>
                <td className="border border-slate-800 p-1 h-6 font-medium">Matricule : {bulletin?.matricule}</td>
                <td className="border border-slate-800 p-1 space-x-2 font-medium" colSpan={2}><span>{bulletin?.gender === "F" ? "Redoublante" : "Redoublant"} :</span> {bulletin?.repeater ? "Oui" : "Non"}
                </td>
                <td className="border border-slate-800 p-1 font-medium" rowSpan={2}>Professeur principal : </td>
              </tr>
  
              <tr>
                <td className="border border-slate-800 p-1 h-6 font-medium" colSpan={3}>Noms et contacts des parents / tuteurs : {bulletin?.contact} </td>
              </tr>

            </tbody>
          </table>
        </aside>
  
        {/* NOTES */}
        <aside>
          <SubjectsCompetenciesTable subjects={bulletin?.results} style={tdStyle} />
        </aside>
  
      </section>
  
      {/* BAS DE PAGE DU BULLETIN */}
      <footer className="flex text-xs mt-2">
  
        <BulletinBottomTable tdStyle={tdStyle} stats={bulletin.class_stats} points={bulletin?.total_raw_points} average={bulletin?.average} grade={bulletin?.overall_cote} StudentName={bulletin?.student_name} appreciationFinale={bulletin?.overall_app} rank={bulletin?.rank} />
  
      </footer>
    </main>
  );
})

export default BulletinOfficial
