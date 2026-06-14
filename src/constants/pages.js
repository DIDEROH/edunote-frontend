import { useAuth } from "../context/AuthContext";

// On crée une fonction réutilisable pour obtenir les pages selon l'utilisateur actuel
export const useNavigationPages = () => {
    const { roles } = useAuth();

    const isAdmin = Array.isArray(roles) && roles.includes('Admin');
    const isTeacher = Array.isArray(roles) && roles.includes('Teacher');
    const isDirector = Array.isArray(roles) && roles.includes('Director');

    // Base des pages visibles par tout le monde
    const pages = [
        { name: 'Tableau de bord', to: '/edunote', icon: 'HomeIcon' },
        { name: 'Étudiants', to: '/edunote/students', icon: 'Students' },
        { name: 'Bulletins', to: '/edunote/bulletins', icon: 'Bulletins' },
    ];

    if (isAdmin) {
        pages.push(
            { name: 'Effectifs', to: '/edunote/effectifs', icon: 'Effectifs' },
            { name: 'Écoles', to: '/edunote/school', icon: 'School' }
        );
    }

    if (isTeacher) {
        pages.push(
            { name: 'Saisie des notes', to: '/edunote/marks/entry', icon: 'Settings' },
            { name: 'Hub des notes', to: '/edunote/marks/hub', icon: 'Bulletins' }
        );
    }

    if (isDirector) {
        pages.push(
            { name: 'Directeurs', to: '/edunote/directors/list', icon: 'Teachers' },
            { name: 'Performances', to: '/edunote/director/performances', icon: 'Reports' }
        );
    }

    return pages;
};
