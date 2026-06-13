export default function TrComponent({ children }) {
  return (
    <tr className="bg-white/80 hover:bg-indigo-50/30 transition-all shadow-sm border border-slate-100">
        {children}  
    </tr>
  )
}