import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function BackComponent({ to = -1, label = 'Retour' }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 rounded-md bg-base-200 px-4 py-2 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}

export default BackComponent
