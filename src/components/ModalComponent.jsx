export default function ModalComponent({ children }) {
  return (
    <div
      className="
        fixed inset-0 z-[80]
        flex items-center justify-center
        p-0 sm:p-6
        bg-black/40
      "
    >
      <div
        className="
          relative w-full h-full sm:h-auto sm:max-w-md
          overflow-y-auto
          sm:rounded-md
          bg-base-200
        "
      >
        {children}
      </div>
    </div>
  );
}

ModalComponent.Title = function ({ children }) {
  return (
    <div className="px-6 py-4">
      <h2 className="text-base font-semibold text-base-content">
        {children}
      </h2>
    </div>
  );
};

ModalComponent.Body = function ({ children }) {
  return (
    <div className="px-6 py-4 text-base-content/80">
      {children}
    </div>
  );
};

ModalComponent.Action = function ({ children }) {
  return (
    <div
      className="
        flex flex-col-reverse gap-2
        px-6 py-4
        sm:flex-row sm:justify-end
      "
    >
      {children}
    </div>
  );
};
