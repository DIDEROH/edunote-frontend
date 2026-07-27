import { useAuth } from "../context/AuthContext";

// On crée une fonction réutilisable pour obtenir les pages selon l'utilisateur actuel
export const useNavigationPages = () => {
    const { roles, loading } = useAuth(); // 👈 Récupération de loading pour éviter les sauts d'affichage

    // Si le contexte charge encore les données de l'utilisateur, on retourne une liste vide temporairement
    if (loading) {
        return [];
    }

    // 🟢 Utilisation des slugs en minuscules configurés dans Laravel et stockés dans React
    const isAdmin = Array.isArray(roles) && roles.includes('admin');
    const isTeacher = Array.isArray(roles) && roles.includes('teacher');
    const isDirector = Array.isArray(roles) && roles.includes('director');
    const isModerator = Array.isArray(roles) && roles.includes('moderator');


    // Base des pages visibles par tout le monde connecté
    const pages = []; 
    
    // Les access des admins et directeurs
    if (isDirector || isAdmin) {
        pages.push(
            { name: 'Tableau de bord', to: '/home', icon: 'Dashboard' }
        )
    }
    
    // Les access des admins et directeurs
    if (isDirector) {
        pages.push(
            { name: 'Affectations enseignants', to: '/director/teachers', icon: 'Teachers' },
        )
    }
    
    // Les access des admins, directeurs et moderateurs
    if (isAdmin || isModerator || isDirector) {
        pages.push(
            { name: 'Élèves', to: '/students', icon: 'Students' },
            { name: 'Bulletins', to: '/report-card', icon: 'ReportCard' },
        )
    }
    
    if (isAdmin) {
        pages.push(
            { name: 'Écoles', to: '/schools', icon: 'Schools' },
            { name: 'Classes', to: '/classrooms', icon: 'Classrooms' },
            { name: 'Matières et Compétences', to: '/pedagogie', icon: 'Subjects' }
        );
    }

    if (isTeacher) {
        pages.push(
            { name: 'Hub des notes', to: '/marks/hub', icon: 'HubMark' },
            { name: 'Saisie des notes', to: '/marks/entry', icon: 'MarkEntry' }
        );
    }

    
    // if (isDirector) {
    //     pages.push(
    //         { name: 'Vérouillage des trimestres', to: '/term', icon: 'Terms' }
    //     );
    // }

    if (isAdmin) {
        pages.push(
            {name: 'Autres', to: '/others', icon: 'Others'}
        )
    }

    return pages;
};
