import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function BackComponent({ to = -1, label = 'Retour' }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}

export default BackComponent
