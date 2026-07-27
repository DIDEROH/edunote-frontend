export default function SubjectsSequencesTable({ data, subjects, style }) {
  const rows = subjects ?? data?.subjects ?? [];
  const sequences = rows[0].sequences ?? [];

  const fmt = (n, digits = 1) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    return Number(n).toFixed(digits);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="border border-slate-400 w-full table-xs text-[10px]">
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

            const sequence1 = item?.sequences?.find(
              (seq) => seq.position === 1
            );

            const sequence2 = item?.sequences?.find(
              (seq) => seq.position === 2
            );

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


                <td className={`text-center ${style}`}>
                  {fmt(sequence1?.mark)}
                </td>


                <td className={`text-center ${style}`}>
                  {fmt(sequence2?.mark)}
                </td>


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
                  {min !== null
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