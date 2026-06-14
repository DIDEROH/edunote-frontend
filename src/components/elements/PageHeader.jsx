import { useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { useAnimations } from "../../utils/animations";

export default function PageHeader({
  title = "Tableau de bord",
  subtitle = "Bienvenue sur votre espace de gestion",
  searchPlaceholder = "Rechercher...",
  onSearch,
}) {

    const containerRef = useRef(null);
    useAnimations(containerRef);

  return (
    <header ref={containerRef} className="relative overflow-hidden rounded-xl w-full min-h-[130px] bg-gradient-to-r from-blue-800 via-blue-700 to-violet-800 p-6 md:p-8 shadow-xl">
      
      {/* Décorations */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Texte */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight animate-reveal">
            {title}
          </h1>

          <p className="mt-2 text-sm md:text-base text-blue-100 max-w-2xl animate-reveal">
            {subtitle}
          </p>
        </div>

        {/* Recherche */}
        {
            onSearch && (
                <div className="w-full lg:w-[380px]  animate-reveal">
                <div className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl px-4 py-3 transition-all duration-300 focus-within:bg-white/20 focus-within:border-white/40">
                    
                    <FiSearch className="text-xl text-white/80 group-focus-within:text-white" />

                    <input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="w-full bg-transparent text-white placeholder:text-white/60 outline-none"
                    />
                </div>
                </div>
            )
        }

      </div>
    </header>
  );
}