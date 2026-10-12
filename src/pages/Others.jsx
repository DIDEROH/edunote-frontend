import PageHeader from "../components/elements/PageHeader";
import { UserCog, UserCog2 } from "lucide-react";
import { MdOutlineCalendarMonth } from "react-icons/md"
import { Card1 } from "../components/ui/CardsComponents";
import { LinkArrowRight } from "../components/ui/LinksComponents";
import { FaUserTie } from "react-icons/fa";
import { PiChalkboardTeacherFill } from "react-icons/pi";



const elements = [
  {
    title: "Gestion des utilisateurs",
    description: "Gérez les utilisateurs de l'application, attribuez des permissions pour contrôler l'accès aux différentes fonctionnalités.",
    icon: UserCog2,
    to: "/users"
  },
  {
      title: "Chefs d'établissement",
      description: "Afficher tous les chefs d'établissements et les informations de leurs écoles assignées",
      to: "/director-list",
      icon: FaUserTie
  },
  {
      title: "Assistants d'établissement",
      description: "Rattachez les assistants à une école : ils consultent les élèves et les bulletins de leur établissement.",
      to: "/moderator-list",
      icon: UserCog
  },
  {
      icon: PiChalkboardTeacherFill,
      title: "Enseignants",
      description: "Afficher et gerer les enseignants de tous les établissements",
      to: "/teacher-list"
  },
  {
    title: "Gestion des Années Scolaires",
    description: "Gérez les Années de l'application pour controller les différentes statistiques, Activer, Déseactivez, Supprimez. ",
    icon: MdOutlineCalendarMonth,
    to: "/academic-years"
  }
]


function Others() {
  return (
    <div>
      <PageHeader
        title="Autres fonctionnalités"
        subtitle="Gérez les autres fonctionnalités de l'application"
      />

      <div className="py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {
          elements.map((element) => (
            <Card1
            key={element.title}
            data={element}
            btn={<LinkArrowRight
              link={element.to}
              color="text-primary"
              abs={true}>Prise en main</LinkArrowRight>} />
          ))
        }
      </div>
    </div>
  )
}

export default Others
