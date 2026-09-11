export default function AuthCard({ icon: Icon, title, description, footer, children }) {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-12">

      {/* Conteneur principal de la carte */}
      <div className="w-full max-w-lg bg-base-200 rounded-md p-6 md:p-10 flex flex-col gap-8">

        {/* Section En-tête Responsive */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-5 pb-6">

          {/* Wrapper de l'icône */}
          {Icon && (
            <div className="shrink-0 flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-md bg-primary text-primary-content">
              <Icon size={28} />
            </div>
          )}

          {/* Textes de l'en-tête */}
          <div className="flex-1 flex flex-col text-center md:text-left justify-center">
            <h1 className="text-lg font-semibold text-base-content leading-snug">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm text-base-content/60 leading-relaxed">
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
          <div className="pt-6 text-center text-sm text-base-content/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
