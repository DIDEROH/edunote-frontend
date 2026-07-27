import {formatDate} from "../utils/FormatDate"
import BulletinBottomTable from "./BulletinBottomTable";
import DeviseComponent from "./DeviseComponent";
import Logo from "./Logo";
import SmallStars from "./SmallStars";
import {forwardRef} from 'react'
import SubjectsCompetenciesTable from "./SubjectsCompetenciesTable";
import { User } from "lucide-react";
import SubjectsSequencesTable from "./SubjectsSequencesTable";

const BulletinOfficial = forwardRef(({bulletin}, ref) => {
  const tdStyle = "border border-slate-800 font-bold text-[10px]"
  return (
    <main ref={ref} className="bg-base-100 print:bg-white text-black p-3 w-full max-w-5xl mx-auto text-sm">
      {/* EN-TETE */}
      <header className="flex justify-between mb-2">
        <aside className="flex flex-col items-center text-[8px]">
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
          <span className="font-bold text-xs">{bulletin?.school?.name}</span>
          <span className="capitalize text-[9px] italic">{bulletin?.school?.motto}</span>
          <Logo className="w-18" />
          <span className="font-semibold uppercase text-xs">{bulletin?.school?.code}</span>
          <span className="font-semibold uppercase text-center text-xs">BULLETIN SCOLAIRE DU {bulletin?.term?.name}</span>
          <span className="font-semibold text-xs">Année scolaire :  {bulletin?.academic_year?.name}</span>
        </aside>
  
        <aside className="flex flex-col items-center text-[8px]">
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
  
          <div className="aspect-square h-20 border border-slate-300 m-2 rounded-xl flex-none flex items-center justify-center overflow-hidden">
            {bulletin?.student?.photo ? <img src={bulletin.student.photo} className="h-full w-full object-cover object-center" /> : <User size={50} />}
          </div>
  
          <table className="border-collapse border border-slate-400 w-full text-[11px]">
            <tbody>

              <tr>
                <td colSpan={3} className={tdStyle}>
                  Noms et Prénoms de l'élève : <span className="font-bold uppercase text-xs">{bulletin?.student?.first_name } {bulletin?.student?.last_name}</span>
                </td>
                <td className="border border-slate-800 p-1 font-medium">Classe : {bulletin?.classroom?.name} </td>
              </tr>
  
              <tr>
                <td className="border border-slate-800 p-1 h-6 font-medium" colSpan={2}>Date et lieu de naissance :  {formatDate(bulletin?.student?.birth_date)} à {bulletin?.student?.birth_place}</td>
                <td className="border border-slate-800 p-1 font-medium">Genre : {bulletin?.student?.gender === "F" ? "Feminin" : "Masculin"}</td>
                <td className="border border-slate-800 p-1 font-medium">Effectif : <span className="font-black"> {bulletin?.total_ranked_students}</span> </td>
              </tr>
  
              <tr>
                <td className="border border-slate-800 p-1 h-6 font-medium">Matricule : {bulletin?.student?.matricule}</td>
                <td className="border border-slate-800 p-1 space-x-2 font-medium" colSpan={2}><span>{bulletin?.gender === "F" ? "Redoublante" : "Redoublant"} :</span> {bulletin?.is_repeating ? "Oui" : "Non"}
                </td>
                <td className="border border-slate-800 p-1 font-medium" rowSpan={2}>Professeur principal : </td>
              </tr>
  
              <tr>
                <td className="border border-slate-800 p-1 h-6 font-medium" colSpan={3}>Noms et contacts des parents / tuteurs : {bulletin?.student?.contact} </td>
              </tr>

            </tbody>
          </table>
        </aside>
  


        {/* NOTES */}
        <aside>
          {
            bulletin?.evaluation_type === 'sequence' ?
              <SubjectsSequencesTable subjects={bulletin?.subjects} style={tdStyle} />
              :
              <SubjectsCompetenciesTable subjects={bulletin?.subjects} style={tdStyle} />
          }
        </aside>
  
      </section>
  
      {/* BAS DE PAGE DU BULLETIN */}
      <footer className="flex text-xs mt-2">
  
        <BulletinBottomTable tdStyle={tdStyle}
          data={{ 
              coefs: bulletin?.total_coefficients,
              percent: bulletin?.success_rate,
              success: bulletin?.passed_students,
              maxG: bulletin?.highest_average,
              minG: bulletin?.lowest_average,
              moyG: bulletin?.class_average,
              moyenne: bulletin?.global_average,
              total: bulletin?.total_weighted_marks,
              rang: bulletin?.rank,
              cote: bulletin?.global_appreciation?.cote,
              finalAppreciation: bulletin?.global_appreciation?.appreciation
           }}
        />
  
      </footer>
    </main>
  );
})

export default BulletinOfficial
