import { FaBookOpen, FaAward } from "react-icons/fa";

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
  }
  
];


function Pedagogie() {
  return (
    <div>
      <PageHeader
        title="Autres fonctionnalités"
        subtitle="Gérez les autres fonctionnalités de l'application"
      />

      <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
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

export default Pedagogie
