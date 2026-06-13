
// Fonction de base initialisant les paragraphes
function Paragraph({ children, className, size }) {
    return <p className={`${className ? className : ""} ${size}`}>{children}</p>
}


function PextraSmall({ children, className }){
    return <Paragraph className={className} size={"text-xs"} children={children} />
}

function PSmall({ children, className }){
    return <Pararaph className={className} size={"text-sm"} children={children} />
}

function PMedium({ children, className }){
    return <Pararaph className={className} size={"text-md"} children={children} />
}

function PLarge({ children, className }){
    return <Pararaph className={className} size={"text-lg"} children={children} />
}

export{
   PextraSmall
}