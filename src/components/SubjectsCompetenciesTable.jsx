
export default function SubjectsCompetenciesTable({ data, subjects, style }) {
  const rows = subjects ?? data?.subjects ?? [];

 

  const fmt = (n, digits = 1) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    return Number(n).toFixed(digits);
  };


  return (
    <div className="w-full overflow-x-auto">
      <table className="border border-slate-400 w-full table-xs text-[11px]">
        <thead>
          <tr>
            <th className={style}>MATIÈRES</th>
            <th className={style}>COMPÉTENCES ÉVALUÉES</th>
            <th className={style}>N/20</th>
            <th className={style}>M/20</th>
            <th className={style}>Coef</th>
            <th className={style}>M x coef</th>
            <th className={style}>COTE</th>
            <th className={style}>[Min – Max]</th>
            <th className={style}>Appréciations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const subjectName = item?.name ?? "";
            const coef = item?.coefficient ?? "";
            const mean = item?.mark;
            const weighted = item?.weighted_mark;
            const cote = item?.appreciation?.cote ?? "";
            const appreciation = item?.appreciation?.appreciation ?? "";
            const competencies = item?.skills ?? [];
            const min = item?.lowest_mark;
            const max = item?.highest_mark;
            const rowSpan = competencies.length || 1;
            const teacher = item?.teacher_name || ""

            return (competencies.length ? competencies : [{}]).map((comp, idx) => (
              <tr key={`${subjectName}-${idx}`}>
                {idx === 0 && (
                  <td rowSpan={rowSpan} className={style}>
                    {subjectName}
                    <span className="block font-light text-[8px] italic">M./Mme {teacher}</span>
                  </td>
                )}
                <td className={`${style} font-light text-[7px]`}>{comp?.skill_name}</td>
                <td className={`text-center ${style}`}>{fmt(comp?.mark)}</td>
                {idx === 0 && (
                  <>
                    <td rowSpan={rowSpan} className={`text-center ${style}`}>
                      {fmt(mean)}
                    </td>
                    <td rowSpan={rowSpan} className={`text-center ${style}`}>
                      {coef}
                    </td>
                    <td rowSpan={rowSpan} className={`text-center ${style}`}>
                      {fmt(weighted)}
                    </td>
                    <td rowSpan={rowSpan} className={`text-center ${style}`}>
                      {cote}
                    </td>
                    <td rowSpan={rowSpan} className={`text-center ${style}`}>
                      {min !== null ? `${fmt(min)} – ${fmt(max)}` : ""}
                    </td>
                    <td rowSpan={rowSpan} className={`text-center ${style} font-light`}>
                      {appreciation}
                    </td>
                  </>
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}
