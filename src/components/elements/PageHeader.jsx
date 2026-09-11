import { FiSearch } from "react-icons/fi";

export default function PageHeader({
  title = "Tableau de bord",
  subtitle = "Bienvenue sur votre espace de gestion",
  searchPlaceholder = "Rechercher...",
  onSearch,
}) {

  return (
    <header className="w-full mb-4 rounded-md bg-primary px-5 py-5 md:px-7 md:py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 className="text-lg font-semibold text-white">
          {title}
        </h1>

        <p className="mt-1 text-sm text-white/70 max-w-2xl">
          {subtitle}
        </p>
      </div>

      {onSearch && (
        <div className="w-full lg:w-95">
          <div className="flex items-center gap-3 rounded-md bg-white/15 px-4 py-2.5">
            <FiSearch className="text-base text-white/70" />

            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
            />
          </div>
        </div>
      )}

    </header>
  );
}
