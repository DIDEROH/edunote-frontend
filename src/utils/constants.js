import { Cpu, Database, Globe, Zap } from "lucide-react";

// Les versions du projet
export const VERSION = "1.0";

// les tailles pour les icones 
export const SIZE_ICON_BIG = 200;
export const SIZE_ICON_XS = 9;
export const SIZE_ICON = 15;
export const SIZE_ICON_LG = 20;
export const SIZE_ICON_XL = 28;

// L'url de l'API
// export const API_URL = "https://durinfo.genuime.com";
export const API_URL = "http://localhost:8000";
// export const API_URL = "http://10.123.83.207:8000";


// Les classes de l'input
export const INPUT_CLASSES = "input input-bordered w-full bg-base-100/50 focus:border-primary transition-colors outline-none rounded-full";

// Les classes de l'input
export const TEXT_AREA_CLASSES = "textarea w-full bg-base-100/50 focus:border-primary transition-colors outline-none rounded-xl";
// Les classes pour select 
export const SELECT_CLASSES = "select select-bordered w-full bg-base-100 font-medium outline-none";



// Le json du homePage pour le test des blocs de dernières actualités 



const IDEAS = [
  { id: 1, title: "IA Générative & Éthique", category: "IA", status: "En cours", description: "Biais algorithmiques dans les LLM.", size: "medium", icon: Cpu, color: "text-primary" },
  { id: 2, title: "Architecture Micro-services", category: "Système", status: "Concept", description: "Patterns asynchrones.", size: "medium", icon: Database, color: "text-secondary" },
  { id: 3, title: "Web3 Identity", category: "Blockchain", status: "Prototype", description: "Authentification décentralisée.", size: "medium", icon: Globe, color: "text-green-400" },
  { id: 4, title: "Optimisation de Rendu", category: "Web", status: "Terminé", description: "Analyse du Shadow DOM.", size: "medium", icon: Zap, color: "text-yellow-400" }
];