import { formatDecimal } from "../utils/FormatDecimal";

/**
 * BulletinBottomTable
 * Version avec APPRÉCIATIONS (CTBA, CBA, CA, CMA)
 * Conforme au modèle du bulletin camerounais.
 */
export default function BulletinBottomTable({ tdStyle, data }) {

  return (

    <div className="relative w-full">
      {/* NOM DE L'ELEVE EN FILLIGRAMME */}
      <div className="font-black text-gray-400/60  translate-middle uppercase text-md absolute z-0 left-1/2 bottom-0 -translate-x-1/2">
        {data?.StudentName}
      </div>  
  
      <table className="border-collapse border border-slate-400 w-full table-xs">

        <thead>
          <tr>
            <th className="border border-slate-800 p-1 bg-gray-400 text-black font-black text-[10px]" colSpan={4}>Discipline</th>
            <th className="border border-slate-800 p-1 bg-gray-400 text-black font-black text-[10px]" colSpan={4}>Travail de l'élève</th>
            <th className="border border-slate-800 p-1 bg-gray-400 text-black font-black text-[10px]" colSpan={4}>Profil de la classe</th>
          </tr>
        </thead>

        <tbody>
          {/* Ligne 1 */}

          <tr>
            <td className={`${tdStyle} w-3/24`}>Abs. non. J. (h)</td>
            <td className={`${tdStyle} w-1/24`}></td>
            <td className={`${tdStyle} w-3/24`}>Avertissement de conduite</td>
            <td className={`${tdStyle} w-1/24`}></td>
            <td className={`${tdStyle} w-3/24`}>Total Général</td>
            <td className={`${tdStyle} w-1/24 text-center`}>{formatDecimal(data?.total)}</td>
            <td className={`${tdStyle} w-4/24 text-center`} colSpan={2}>Appréciations</td>
            <td className={`${tdStyle} w-4/24`} colSpan={2}>Moyenne générale</td>
            <td className={`${tdStyle} w-4/24 text-center`} colSpan={2}>{formatDecimal(data?.moyG)}</td>
          </tr>

          {/* Ligne 2 (début fusion verticale) */}
          <tr>
            <td className={`${tdStyle} w-3/24`} >Abs. J. (h)</td>
            <td className={`${tdStyle} w-1/24`} ></td>
            <td className={`${tdStyle} w-3/24`} >Blâme de conduite</td>
            <td className={`${tdStyle} w-2/24`} ></td>
            <td className={`${tdStyle} w-1/24`} >Coef</td>
            <td className={`${tdStyle} text-center w-2/24`} >{data?.coefs}</td>

            <td className={`${tdStyle} w-2/24 text-center font-light`} colSpan={2}>{data?.finalAppreciation}</td>

            <td className={`${tdStyle} w-4/24`}  colSpan={2}>[Min - Max]</td>
            <td className={`${tdStyle} w-4/24 text-center`} >[{formatDecimal(data?.minG)} - {formatDecimal(data?.maxG)}]</td>
          </tr>


          {/* 🔁 NOUVELLE LIGNE AVEC LA MÊME STRUCTURE */}
          <tr>
            <td className={`${tdStyle}`} >Retards (nombres de fois)</td>
            <td className={`${tdStyle}`} ></td>
            <td className={`${tdStyle}`} >Exclusions (jours)</td>
            <td className={`${tdStyle}`} ></td>
            <td className={`${tdStyle}`} >Moyenne Trim</td>
            <td className={`${tdStyle} text-center`} >{formatDecimal(data?.moyenne)}</td>

            <td className={`${tdStyle} text-center`}>RANG</td>
            <td className={`${tdStyle} text-center`}>{data?.rang}</td>

            <td className={`${tdStyle}`}  colSpan={2}>Nombres de Moyennes</td>
            <td className={`${tdStyle} text-center`} >{data?.success}</td>
          </tr>

          {/* 🔁 NOUVELLE LIGNE AVEC LA MÊME STRUCTURE */}
          <tr>
            <td className={`${tdStyle}`} >Consignes (heures)</td>
            <td className={`${tdStyle}`} ></td>
            <td className={`${tdStyle}`} >Exclusion défintive</td>
            <td className={`${tdStyle}`} ></td>
            <td className={`${tdStyle}`} >COTE</td>
            <td className={`${tdStyle} text-center`} >{data?.cote}</td>

            <td className={`${tdStyle}`} colSpan={2}></td>

            <td className={`${tdStyle}`} colSpan={2}>Taux de reussite</td>
            <td className={`${tdStyle} text-center`}>{formatDecimal(data?.percent)}%</td>
          </tr>

        </tbody>

        <tfoot>
            <tr>
              <td className={`text-center ${tdStyle}`} colSpan={3}>Appréciation du travail de l'élève (points forts et points à améliorer) <br /><br /><br /><br /><br /></td>
              <td className={`text-center ${tdStyle}`} colSpan={2}>Visa du parent / Tuteur <br /><br /><br /><br /><br /></td>
              <td className={`text-center ${tdStyle}`} colSpan={3}>Nom et Visa du proffeseur principal<br /><br /><br /><br /><br /></td>
              <td className={`text-center ${tdStyle}`} colSpan={3}>Le Chef d'établissement<br /><br /><br /><br /><br /></td>
            </tr>
        </tfoot>

      </table>
    </div>

  );
}
