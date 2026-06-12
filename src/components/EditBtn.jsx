import { PencilIcon } from '@heroicons/react/24/outline'

export default function EditBtn({ action, text }) {
  const handleClick = (event) => {
        if (typeof action === 'function') {
            action(event); 
        }
    }
  return (
    <button className={`btn text-primary cursor-pointer btn-ghost btn-xs ${!text ? 'btn-circle' : ''}`} onClick={handleClick}>
      <PencilIcon className='icone' /> {text && "Modifier"}
    </button>
  )
}
