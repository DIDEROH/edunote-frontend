import { ArrowRight, ArrowUpRight } from "lucide-react"
import handleClick from '../utils/verifFunction';
import { Link } from "react-router-dom";


// Les fonctions et constantes de liens personnalisés
const LinkClassName = {
    linkGhost: {
        class: "transition-colors inline-flex items-center gap-1 group font-semibold cursor-pointer",
        iconeClass: "opacity-0 group-hover:opacity-100 transition-opacity"
    },
    linkSimple: {
        class: "transition-colors inline-flex items-center gap-1 group font-semibold cursor-pointer",
        iconeClass: ""
    },
    linkArrowRight: {
        class: "inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer group-hover:gap-4 hover:gap-4",
        iconeClass: ""
    },
    linkBtn: {
        class: " inline-flex items-center gap-2 rounded-xl border border-base-content/10 bg-base-200/70 px-4 py-2.5 text-sm font-bold text-base-content transition-all duration-300 hover:border-info/30 hover:bg-info hover:text-info-content",
        iconeClass: " transition-transform duration-300 group-hover:translate-x-1"
    }
}


// Composant de base pour les liens
function Lnk(props) {
    const Icon = props.icon;
    return(
        <Link to={props.link}
        target={props.target || "_self"}
        rel="noopener noreferrer"
        onClick={() => handleClick(props.onAction)}
        className={`${props.abs ? " after:absolute after:inset-0 " : ""}  ${props.hoverColor ? `hover:${props.hoverColor}` : ""} ${props.color ? `${props.color}` : ""} ${props.className}`}>
            {props.children}
            {Icon && <Icon className={props.classIcon} size={16} />}
        </Link>
    )
}


// LES RENDERS DE LIENS PRÉCONFIGURÉS
function LinkArrowRight(props) {
    return(
        <Lnk
        {...props}
        icon={ArrowRight}
        className={LinkClassName.linkArrowRight.class}
        classIcon={LinkClassName.linkArrowRight.iconeClass}
        />
    )
}

function LinkGhost(props) {
    return(
        <Lnk
        {...props}
        icon={ArrowUpRight}
        className={LinkClassName.linkGhost.class}
        classIcon={LinkClassName.linkGhost.iconeClass}
        />
    )
}

function LinkBtn(props) {
    return(
        <Lnk
        {...props}
        icon={ArrowRight}
        className={LinkClassName.linkBtn.class}
        classIcon={LinkClassName.linkBtn.iconeClass}
        />
    )
}

function LinksSimple(props) {
    return(
        <Lnk
        {...props}
        className={LinkClassName.linkSimple.class}
        />
    )
}



export { LinkArrowRight, LinkGhost, LinkBtn, LinksSimple };