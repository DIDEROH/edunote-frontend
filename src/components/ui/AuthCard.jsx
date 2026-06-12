import { useRef } from "react";
import { useAnimations } from "../../utils/animations";

export default function AuthCard({ icon: Icon, title, description, footer, children }) {
  const containerRef = useRef(null);
  useAnimations(containerRef);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 overflow-hidden selection:bg-indigo-500 selection:text-white"
    >
      {/* Orbes lumineuses d'arrière-plan pour donner de la profondeur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full  pointer-events-none" />

      {/* Conteneur principal de la carte */}
      <div className="w-full max-w-lg  backdrop-blur-xl  p-6 md:p-10  animate-reveal flex flex-col gap-8">
        
        {/* Section En-tête Responsive */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6 pb-6 border-b border-slate-800/60">
          
          {/* Wrapper de l'icône */}
          {Icon && (
            <div className="relative shrink-0 flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-transform duration-500 ease-out hover:scale-105 hover:rotate-3">
              <Icon size={32} className="md:size-[40px] text-white" />
              {/* Reflet de lumière interne */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
            </div>
          )}

          {/* Textes de l'en-tête */}
          <div className="flex-1 flex flex-col text-center md:text-left justify-center">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm md:text-base text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Formulaire / Contenu (children) */}
        <div className="flex flex-col gap-4">
          {children}
        </div>

        {/* Pied de carte (footer) */}
        {footer && (
          <div className="pt-6 border-t border-slate-800/60 text-center text-xs md:text-sm text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}