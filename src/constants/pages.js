import { useAuth } from "../context/AuthContext";

/**
 * Menu selon le rôle :
 * - EduNote (admin) : validation des établissements, statistiques, catalogues communs ;
 * - école (directeur, modérateurs) : selon les droits accordés par le directeur ;
 * - enseignant : saisie des notes.
 * `short` : libellé de la barre du bas (téléphone) quand `name` est trop long.
 */
export const useNavigationPages = () => {
    const { roles, loading, can, isSchoolDirector, school } = useAuth();

    // Si le contexte charge encore les données de l'utilisateur, on retourne une liste vide temporairement
    if (loading) {
        return [];
    }

    const has = (role) => Array.isArray(roles) && roles.includes(role);
    const pages = [];

    if (has('admin')) {
        pages.push(
            { name: 'Tableau de bord', short: 'Accueil', to: '/home', icon: 'Dashboard' },
            { name: 'Établissements', short: 'Écoles', to: '/schools', icon: 'Schools' },
            { name: 'Catalogue des classes', short: 'Classes', to: '/classrooms', icon: 'Classrooms' },
            { name: 'Catalogue des matières', short: 'Matières', to: '/subjects', icon: 'Subjects' },
        );
    }

    // Gestion de l'école : directeur et modérateurs (école validée)
    if ((has('director') || has('moderator')) && school?.status === 'active') {
        pages.push(
            { name: 'Tableau de bord', short: 'Accueil', to: '/home', icon: 'Dashboard' },
            { name: 'Élèves', to: '/students', icon: 'Students' },
            { name: 'Classes et matières', short: 'Classes', to: '/my-classes', icon: 'Classrooms' },
        );
        if (can('classes') && school?.evaluation_type === 'skill') {
            pages.push({ name: 'Compétences', to: '/skills', icon: 'Skills' });
        }
        pages.push(
            { name: 'Personnel', to: '/staff', icon: 'Personnel' },
            { name: 'Affectations', to: '/director/teachers', icon: 'Teachers' },
        );
        if (can('calendar')) {
            pages.push({ name: 'Calendrier', to: '/calendar', icon: 'Terms' });
        }
        if (can('bulletins')) {
            pages.push(
                { name: 'Suivi de la saisie', short: 'Suivi', to: '/mark-progress', icon: 'Progress' },
                { name: 'Bulletins', to: '/report-card', icon: 'ReportCard' },
                { name: 'Historique des notes', short: 'Historique', to: '/mark-history', icon: 'History' },
            );
        }
        if (isSchoolDirector) {
            pages.push(
                { name: 'Passage d\'année', short: 'Passage', to: '/year-transition', icon: 'YearTransition' },
                { name: 'Mon établissement', short: 'Mon école', to: '/my-school', icon: 'Others' },
            );
        }
    }

    if (has('teacher')) {
        pages.push(
            { name: 'Hub des notes', short: 'Notes', to: '/marks/hub', icon: 'HubMark' },
            { name: 'Saisie des notes', short: 'Saisie', to: '/marks/entry', icon: 'MarkEntry' },
            { name: 'Historique des notes', short: 'Historique', to: '/mark-history', icon: 'History' }
        );
    }

    // Un même lien n'apparaît qu'une fois (ex. tableau de bord)
    return pages.filter((page, index) => pages.findIndex((p) => p.to === page.to) === index);
};
