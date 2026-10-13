export default function SubjectsSequencesTable({ data, subjects, style }) {
  const rows = subjects ?? data?.subjects ?? [];
  // 🐛 rows[0] plantait sur une classe sans matière : on prend les séquences
  // de la première matière qui en a (toutes partagent celles du trimestre).
  const sequences = rows.find((row) => row?.sequences?.length)?.sequences ?? [];

  const fmt = (n, digits = 1) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    return Number(n).toFixed(digits);
  };

  return (
    <div className="w-full overflow-x-auto print:overflow-visible">
      <table className="border border-slate-400 w-full table-xs text-[9px]">
        <thead>
          <tr>
            <th className={style}>MATIÈRES</th>
            {
                sequences?.map((seq, index) => <th key={index} className={style}>{seq?.sequence_name}</th>)
            }
            <th className={style}>N/20</th>
            <th className={style}>Coef</th>
            <th className={style}>M x coef</th>
            <th className={style}>COTE</th>
            <th className={style}>[Min – Max]</th>
            <th className={style}>Appréciations</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((item, index) => {
            const subjectName = item?.name ?? "";
            const teacher = item?.teacher_name ?? "";

            const mean = item?.mark;
            const weighted = item?.weighted_mark;
            const coef = item?.coefficient ?? "";

            const cote = item?.appreciation?.cote ?? "";
            const appreciation =
              item?.appreciation?.appreciation ?? "";

            const min = item?.lowest_mark;
            const max = item?.highest_mark;


            return (
              <tr key={`${subjectName}-${index}`}>

                <td className={style}>
                  {subjectName}
                  <span className="block font-light text-[8px] italic">
                    M./Mme {teacher}
                  </span>
                </td>


                {/* Une colonne par séquence du trimestre, alignée sur l'en-tête */}
                {sequences.map((seq) => (
                  <td key={seq.sequence_id} className={`text-center ${style}`}>
                    {fmt(item?.sequences?.find((s) => s.sequence_id === seq.sequence_id)?.mark)}
                  </td>
                ))}


                <td className={`text-center ${style}`}>
                  {fmt(mean)}
                </td>


                <td className={`text-center ${style}`}>
                  {coef}
                </td>


                <td className={`text-center ${style}`}>
                  {fmt(weighted)}
                </td>


                <td className={`text-center ${style}`}>
                  {cote}
                </td>


                <td className={`text-center ${style}`}>
                  {min != null
                    ? `${fmt(min)} – ${fmt(max)}`
                    : ""}
                </td>


                <td className={`text-center ${style} font-light`}>
                  {appreciation}
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}