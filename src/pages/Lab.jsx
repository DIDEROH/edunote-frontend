import { PextraSmall } from "../components/ParagraphsComponents";

export default function Lab() {

  const handleClick = () => {
    alert("Durinfo")
  }

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Lab DURINFO</h1>
      <p className="text-base-content/80 leading-relaxed text-lg">
        Entrez dans le laboratoire DURINFO pour explorer nos prototypes, recherches techniques
        et expérimentations autour du web, de l'intelligence artificielle et des architectures modernes.
      </p>

      <br /><br />

      <div className="flex gap-7">

        <PextraSmall className="text-red-500">
            Durinfo tu es un gros codeur bro
            <br /> <br /> Dance avec les autres
        </PextraSmall>

      </div>
    </div>
  );
}

