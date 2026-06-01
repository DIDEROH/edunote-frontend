import { CheckCircle2 } from "lucide-react"



function ListChecked({ text }) {
    return(
        <li className="flex items-center text-base-content/80">
            <CheckCircle2 size={20} className="mr-3 text-primary" />
            {text}
        </li>
    )
}



export { ListChecked }