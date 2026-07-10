import { useRef } from "react";
import { useAnimations } from "../utils/animations";
import PageHeader from "../components/elements/PageHeader";
import { UserCog2 } from "lucide-react";
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
    color: "from-cyan-500 to-blue-500",
    to: "/users"
  },
  {
      title: "Chefs d'établissement",
      description: "Afficher tous les chefs d'établissements et les informations de leurs écoles assignées",
      color: "from-green-400 to-yellow-300",
      to: "/director-list",
      icon: FaUserTie
  },
  {
      icon: PiChalkboardTeacherFill,
      title: "Enseignants",
      description: "Afficher et gerer les enseignants de tous les établissements",
      color: "from-indigo-400 to-violet-600",
      to: "/teacher-list"
  },
  {
    title: "Gestion des Années Scolaires",
    description: "Gérez les Années de l'application pour controller les différentes statistiques, Activer, Déseactivez, Supprimez. ",
    color: "from-blue-500 to-violet-500",
    icon: MdOutlineCalendarMonth,
    to: "/academic-years"
  }
]


function Others() {
  const containerRef = useRef(null);
  useAnimations(containerRef);


  return (
    <div ref={containerRef}>
        <div className="animate-reveal">
          <PageHeader
            title="Autres fonctionnalités"
            subtitle="Gérez les autres fonctionnalités de l'application"
          />
        </div>
        
        <div className="py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-reveal">
          {
            elements.map((element) => (
              <Card1
              key={element.title}
              data={element}
              btn={<LinkArrowRight
                link={element.to}
                color="text-violet-400"
                abs={true}>Prise en main</LinkArrowRight>} />
            ))
          }
        </div>
    </div>
  )
}

export default Others