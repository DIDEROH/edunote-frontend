export default function Table({ children }) {
  return (
    // <div className="w-full h-full overflow-x-auto overflow-y-visible custom-scrollbar">
      <table className="w-full border-separate border-spacing-y-1 px-2">
        {children}
      </table>
    // </div>
  );
}

Table.Head = function ({ children }) {
  return (
    <thead>
      <tr className="text-slate-400 uppercase text-[10px] tracking-[2px] font-black">
        {/* On applique un padding spécifique aux th via le style global ou des classes inline */}
        {children}
      </tr>
    </thead>
  );
};

Table.Body = function ({ children }) {
  return (
    <tbody className="text-slate-600 font-medium text-xs">
      {/* Note : Pour obtenir l'effet de "cartes" pour chaque ligne, 
          chaque <tr> dans ton Table.Body devrait avoir les classes suivantes :
          "bg-white hover:bg-indigo-50/30 transition-all rounded-2xl shadow-sm border border-slate-100"
      */}
      {children}
    </tbody>
  );
};

Table.Foot = function ({ children }) {
  return (
    <tfoot className="text-slate-400 font-bold text-[10px] uppercase">
      {children}
    </tfoot>
  );
};