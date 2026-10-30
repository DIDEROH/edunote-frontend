import { Info, Pencil, Trash2, X } from 'lucide-react';
import handleClick from '../../utils/verifFunction';

/** Libellé qui « roule » au survol (texte simple seulement) */
function Label({ children }) {
    if (typeof children !== 'string') return children;
    return (
        <span className="roll">
            <span>{children}</span>
            <span aria-hidden="true">{children}</span>
        </span>
    );
}

// Composant de base : bouton en pilule à la largeur du texte
function Btn({ icon: Icon, children, variant = "ui-btn-primary", ...props }) {
    return (
        <button
            type={props.type || "button"}
            disabled={props.disabled}
            onClick={() => handleClick(props.onAction)}
            className={`ui-btn ui-btn-lg ${variant} ${props.className || ""}`}
        >
            <Label>{children}</Label>
            {Icon && <Icon size={17} />}
        </button>
    );
}

// Bouton discret (fond clair)
function CtaBorder({ children, ...props }) {
    const Icon = props.icon;
    return (
        <button type={props.type || "button"} onClick={() => handleClick(props.onAction)} className={`ui-btn ui-btn-lg ui-btn-soft ${props.className || ""}`}>
            {Icon && <Icon size={17} />}
            <Label>{children}</Label>
        </button>
    );
}

// Bouton principal (dégradé indigo lumineux)
function CtaPrimary(props) {
    return <Btn {...props} variant="ui-btn-primary" />;
}

function CtaSecondary(props) {
    return <Btn {...props} variant="ui-btn-success" />;
}

function CtaAccent(props) {
    return <Btn {...props} variant="ui-btn-primary" />;
}

// Bouton secondaire (fond clair, ex. « Annuler »)
function CtaDark(props) {
    return <Btn {...props} variant="ui-btn-soft" />;
}

// Anciens noms conservés : bouton principal
function CtaNeon(props) {
    return <CtaPrimary {...props} />;
}

function CtaGradient(props) {
    return <CtaPrimary {...props} />;
}

function DeleteBtn(props) {
    return (
        <button type="button" title="Supprimer" className={props.text ? "ui-btn ui-btn-sm ui-btn-danger" : "ui-icon-btn ui-icon-btn-sm text-error hover:bg-error/10"} onClick={() => handleClick(props.onAction)}>
            <Trash2 size={15} /> {props.text && (props.text || "Supprimer")}
        </button>
    );
}

function EditBtn(props) {
    return (
        <button type="button" title="Modifier" className={props.text ? "ui-btn ui-btn-sm ui-btn-soft" : "ui-icon-btn ui-icon-btn-sm hover:text-primary"} onClick={() => handleClick(props.onAction)}>
            <Pencil size={15} /> {props.text && "Modifier"}
        </button>
    );
}

function InfoBtn(props) {
    return (
        <button type="button" title="Informations" className="ui-icon-btn ui-icon-btn-sm" onClick={() => handleClick(props.onAction)}>
            <Info size={16} /> {props.text && "Info"}
        </button>
    );
}

function CloseBtn(props) {
    return (
        <button type="button" title="Fermer" className="ui-icon-btn ui-icon-btn-sm" onClick={() => handleClick(props.onAction)}>
            <X size={16} /> {props.text && "Fermer"}
        </button>
    );
}

function CustomBtn({ icon: Icon, onAction, text, toolText, colorText }) {
    return (
        <button type="button" title={toolText} className={`ui-icon-btn ui-icon-btn-sm ${colorText || ""}`} onClick={() => handleClick(onAction)}>
            {Icon && <Icon size={16} />} {text && "Fermer"}
        </button>
    );
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
