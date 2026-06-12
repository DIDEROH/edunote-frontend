import { ListBulletIcon } from "@heroicons/react/24/outline";

export default function BtnList({ action }) {
    const handleClick = (event) => {
        if (typeof action === 'function') {
            action(event); 
        }
    }

  return (
    <button onClick={handleClick} className="btn btn-sm mx-2 rounded-full">
        <ListBulletIcon className="w-4 h-4" /> Liste
    </button>
  )
}