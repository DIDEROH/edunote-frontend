import { PlusIcon } from '@heroicons/react/24/outline'

export default function AddBtn({ action }) {
  const handleClick = (event) => {
        if (typeof action === 'function') {
            action(event); 
        }
    }
  return (
    <button className="w-10 h-10 rounded-full 
         bg-gradient-to-br from-indigo-600 via-teal-500 to-indigo-400
         flex items-center justify-center
         text-white font-black
         shadow-lg
         hover:scale-110 hover:rotate-z-180 hover:shadow-xl
         transition duration-300 ease-in-out cursor-pointer" onClick={handleClick}>
      <PlusIcon className='w-5' />
    </button>
  )
}
