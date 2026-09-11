import { LuEllipsisVertical, LuPencil, LuTrash2, LuX } from 'react-icons/lu';
import handleClick from '../../utils/verifFunction';


// Composant de base pour les boutons
function Btn({ icon: Icon, children, ...props }) {
    return (
        <button
            type={props.type || "button"}
            onClick={() => handleClick(props.onAction)}
            className={`inline-flex items-center justify-center gap-2 rounded-md ${props.bg} px-6 py-2.5 text-sm font-medium ${props.color} transition-colors duration-150 hover:brightness-95 ${props.className || ""}`}
        >
            <span>{children}</span>
            {Icon && <Icon size={18} />}
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
            className="inline-flex items-center justify-center gap-2 rounded-md bg-base-200 px-6 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300"
        >
            {props.icon && (<Icon size={18} />)}
            <span>{children}</span>
        </button>
    )
}

// Bouton Primaire
function CtaPrimary(props) {
    return <Btn {...props} bg="bg-primary" color="text-primary-content" />;
}

// Bouton Secondaire
function CtaSecondary(props) {
    return <Btn {...props} bg="bg-secondary" color="text-secondary-content" />;
}

// Bouton Accent
function CtaAccent(props) {
    return <Btn {...props} bg="bg-accent" color="text-accent-content" />;
}

// Bouton Sombre (neutre)
function CtaDark(props) {
    return <Btn {...props} bg="bg-neutral" color="text-neutral-content" />;
}

// Ancien "CtaNeon"/"CtaGradient" : conservés comme alias du bouton primaire plat
// pour ne pas casser les imports existants, sans dégradé ni effet néon.
function CtaNeon(props) {
    return <CtaPrimary {...props} />;
}

function CtaGradient(props) {
    return (
        <button onClick={() => {handleClick(props.onAction)}} className={`rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-content transition-colors duration-150 hover:brightness-95 ${props.className || ""}`}>
            {props.children}
        </button>
    )
}

function DeleteBtn(props) {
    return (
        <div className="tooltip tooltip-top" data-tip="Supprimer">
            <button className={`btn font-medium text-error btn-ghost ${!props.text ? 'btn-circle' : ''}`} onClick={() => { handleClick(props.onAction) }}>
                <LuTrash2 size={15} /> {props.text && (props.text || "Supprimer")}
            </button>
        </div>
    )
}

function EditBtn(props) {
    return(
        <div className="tooltip tooltip-top" data-tip="Modifier">
            <button className={`btn btn-ghost text-primary ${!props.text ? 'btn-circle' : ''}`} onClick={() => { handleClick(props.onAction) }}>
                <LuPencil size={15} /> {props.text && "Modifier"}
            </button>
        </div>
    )
}

function InfoBtn(props) {
    return (
        <div className="tooltip tooltip-top" data-tip="Informations">
        <button
            className="btn btn-circle btn-ghost text-base-content/70"
            onClick={() => { handleClick(props.onAction) }}
        >
            <LuEllipsisVertical className="w-5 h-5" /> {props.text && "Info"}
        </button>
        </div>
    )
}

function CloseBtn(props) {
    return (
        <div className="tooltip tooltip-top" data-tip="Fermer">
            <button
                className="btn btn-circle btn-ghost"
                onClick={() => { handleClick(props.onAction) }}
            >
                <LuX className="w-5 h-5" /> {props.text && "Fermer"}
            </button>
        </div>
    )
}

function CustomBtn({icon: Icon, onAction, text, toolText, colorText}) {
    return (
        <div className="tooltip tooltip-top" data-tip={toolText}>
            <button
                className={`btn btn-circle btn-ghost ${colorText}`}
                onClick={() => { handleClick(onAction) }}
            >
                { Icon && <Icon className="w-5 h-5" />} {text && "Fermer"}
            </button>
        </div>
    )
}

export {
    CtaNeon,
    CtaPrimary,
    CtaDark,
    CtaAccent,
    CtaSecondary,
    CtaBorder,
    CtaGradient,
    DeleteBtn,
    EditBtn,
    InfoBtn,
    CloseBtn,
    CustomBtn
};
