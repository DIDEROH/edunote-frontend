export default function ModalComponent({ children }) {
  return (
    <div
      className="
        fixed inset-0 z-[80]
        flex items-center justify-center
        p-4 sm:p-6
        bg-black/40 backdrop-blur-sm
        animate-in fade-in duration-200
      "
    >
      <div
        className="
          relative w-full max-w-md
          overflow-hidden
          rounded-3xl
          border border-base-300/50
          bg-base-100
          shadow-2xl
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-300
        "
      >
        {children}
      </div>
    </div>
  );
}

ModalComponent.Title = function ({ children }) {
  return (
    <div className="border-b border-base-300/50 px-6 py-5">
      <h2 className="text-xl font-semibold text-base-content">
        {children}
      </h2>
    </div>
  );
};

ModalComponent.Body = function ({ children }) {
  return (
    <div className="px-6 py-5 text-base-content/80">
      {children}
    </div>
  );
};

ModalComponent.Action = function ({ children }) {
  return (
    <div
      className="
        flex flex-col-reverse gap-3
        border-t border-base-300/50
        px-6 py-5
        sm:flex-row sm:justify-end
      "
    >
      {children}
    </div>
  );
};
