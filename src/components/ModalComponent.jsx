export default function ModalComponent({ children }) {
  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-80">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            { children }
        </div>
    </div>
  )
}

ModalComponent.Title = function ({ children }) {
    return (
        <h2 className="text-lg font-bold mb-4">
            { children }
        </h2>
    )
}

ModalComponent.Body = function ({ children }) {
    return (
        <>
            { children }
        </>
    )
}

ModalComponent.Action = function ({ children }) {
    return (
        <div className="p-3 flex justify-end gap-2">
            { children }
        </div>
    )
}
