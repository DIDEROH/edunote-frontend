import { TrashIcon } from '@heroicons/react/24/outline'

export default function DeleteBtn({ action, text }) {
  const handleClick = (event) => {
        if (typeof action === 'function') {
            action(event); 
        }
    }
  return (
    <button className={`btn text-red-600 font-bold cursor-pointer btn-ghost btn-xs ${!text ? 'btn-circle' : ''}`} onClick={handleClick}>
      <TrashIcon className='icone' /> {text && (text === true ? "Supprimer" : text)}
    </button>
  )
}
