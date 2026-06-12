import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BackComponent() {
    const navigate = useNavigate()
  return (
    <button onClick={() => {navigate(-1)}} className="p-3 mx-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} />
    </button>
  )
}
