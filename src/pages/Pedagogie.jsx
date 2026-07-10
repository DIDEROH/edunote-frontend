import { useRef } from "react";
import { FaBookOpen, FaAward, FaLink } from "react-icons/fa";

import { useAnimations } from "../utils/animations";
import PageHeader from '../components/elements/PageHeader'
import { Card1 } from '../components/ui/CardsComponents'
import { LinkArrowRight } from "../components/ui/LinksComponents";


const elements = [

  {
    title: "Gestion des matières",
    description: "Organisez les matières scolaires et les programmes d'enseignement de l'établissement.",
    icon: FaBookOpen,
    color: "from-cyan-500 to-blue-500",
    to: "/subjects"
  },

  {
    title: "Gestion des compétences",
    description: "Définissez le référentiel des compétences, suivez les acquis et les performances des apprenants.",
    icon: FaAward,
    color: "from-green-400 to-yellow-300",
    to: "/skills"
  },

  {
    title: "Assigner une compétence à une matière",
    description: "Liez les compétences spécifiques aux matières correspondantes pour structurer les évaluations.",
    icon: FaLink,
    color: "from-blue-500 to-violet-500",
    to: "/assign-skills"
  }
  
];


function Pedagogie() {
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

export default Pedagogie
