export default function TdComponent({ children }) {
  return (
    <td 
        className="font-semibold px-2 py-1 border-y border-slate-100 group-hover:border-indigo-200 text-slate-800"
    >
        {children}
    </td>
  )
}
