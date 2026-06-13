import handleClick from '../../utils/verifFunction';


// Composant de base pour les boutons
function Btn({ icon: Icon, children, ...props }) {
    return (
        <button 
            type={props.type || "button"}
            onClick={() => handleClick(props.onAction)}
            className={`inline-flex items-center justify-center gap-2 rounded-full border border-base-content/10 ${props.bg} px-8 py-3 text-sm font-semibold ${props.color} transition-all duration-300 hover:border-primary/30 hover:gap-4 hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-black/20 `}
        >
            <span>{children}</span>
            {Icon && <Icon size={20} />}
        </button>
    );
}

// Bouton avec effet Néon
function CtaNeon({ children, ...props }) {
    const Icon = props.icon;
    return (
        <button 
            type={props.type || "button"}
            onClick={() => handleClick(props.onAction)}
            className={`inline-flex items-center justify-center gap-2 group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-5 font-bold capitalize text-white shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-all duration-300 hover:scale-105 ${props.className || ""}`}
        >
            <span className="relative z-10">{children}</span>
            {props.icon && (<Icon size={20} />)}
            <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
        </button>
    );
}

// Bouton avec bordure et sans fond
function CtaBorder({ children, ...props}) {
    const Icon = props.icon;
    return (
        <button 
            type={props.type || "button"}
            onClick={() => handleClick(props.onAction)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-transparent border-2 border-base-content/20 px-8 py-4 font-bold text-base-content transition-all duration-300 hover:gap-4 hover:bg-base-content/5 hover:border-base-content/40"
        >
            {props.icon && (<Icon size={20} />)}
            <span>{children}</span>
        </button>
    )
}

// Bouton Primaire (Exemple d'intégration)
function CtaPrimary(props) {
    return <Btn {...props} bg="bg-primary" color="text-primary-content" />;
}

// Bouton Secondaire (Exemple d'intégration)
function CtaSecondary(props) {
    return <Btn {...props} bg="bg-secondary" color="text-secondary-content" />;
}

// Bouton Accent (Exemple d'intégration)
function CtaAccent(props) {
    return <Btn {...props} bg="bg-accent" color="text-accent-content" />;
}

// Bouton Sombre (Utilise le composant Btn)
function CtaDark(props) {
    return <Btn {...props} bg="bg-slate-900" color="text-slate-200" />;
}

function CtaGradient(props) {
    return(
        <button onClick={() => {handleClick(props.onAction)}} className={`rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-violet-500/30 transition-all duration-300 hover:scale-105 ${props.className || ""}`}>
            {props.children}
        </button>
    )
}

export {
    CtaNeon,
    CtaPrimary,
    CtaDark,
    CtaAccent,
    CtaSecondary,
    CtaBorder,
    CtaGradient
};
