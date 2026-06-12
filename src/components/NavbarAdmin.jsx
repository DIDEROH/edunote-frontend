import { 
  BookOpenIcon, BuildingLibraryIcon, 
  CalendarDaysIcon, ChartBarIcon, ChartBarSquareIcon, CheckBadgeIcon, 
  ClipboardDocumentListIcon, DocumentTextIcon, 
  ShieldCheckIcon, Squares2X2Icon, UserGroupIcon, UserIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import DrawerLink from './DrawerLinks'
import { useHasRole } from '../hooks/UseHasRole';

function NavbarAdmin() {
    const [openMenu, setOpenMenu] = useState(null);
    const sizeIcon = "h-4 w-4"
    const isAdmin = useHasRole('Admin')
    const isTeacher = useHasRole('Teacher')
    const isDirector = useHasRole('Director')
    
    // La classe que tu as définie pour l'uniformité
    const expandableItem = "flex items-center justify-between w-full px-4 py-2 text-xs font-bold  hover:bg-slate-50 rounded-2xl transition-all duration-200";
    const sectionTitle = "px-4 mt-6 mb-2 text-[10px] font-black uppercase tracking-[2px] text-slate-400/80";
    const positionMenu = 'flex flex-col gap-1.5 items-start pl-4 text-[11px] mb-4 mt-1 border-l-2 border-slate-50 ml-6';

    const toggleSubMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    return (
        <>
            {/* Admin */}
            {isAdmin && (
            <ul className="menu w-full text-xs space-y-1 pb-10">
                <h2 className='px-4 text-xl font-black text-slate-800 tracking-tight capsule'>
                    Espace Admin
                </h2>

                {/* --- ANALYTIQUE --- */}
                <p className={sectionTitle}>Analytique</p>
                <li>
                    <DrawerLink to="/edunote/stats" className={expandableItem}>
                        <div className='flex gap-2'><ChartBarIcon className={sizeIcon} /> Taux de réussite</div>
                    </DrawerLink>
                </li>
                <li>
                    <DrawerLink to="/edunote/effectifs" className={expandableItem}>
                        <div className='flex gap-2'><ChartBarSquareIcon className={sizeIcon} /> Effectifs</div>
                    </DrawerLink>
                </li>

                {/* --- STRUCTURE --- */}
                <p className={sectionTitle}>Structure</p>

                <li>
                    <DrawerLink to="/edunote/students" className={expandableItem}>
                        <div className='flex gap-2'><UserGroupIcon className={sizeIcon} /> Elèves</div>
                    </DrawerLink>
                </li>

                <li>
                    <DrawerLink to="/edunote/classrooms" className={expandableItem}>
                        <div className='flex gap-2'><Squares2X2Icon className={sizeIcon} /> Salles de classes</div>
                    </DrawerLink>
                </li>
                
                <li>
                    <DrawerLink to="/edunote/subjects" className={expandableItem}>
                        <div className='flex gap-2'><BookOpenIcon className={sizeIcon} /> Matières</div>
                    </DrawerLink>
                </li>

                <li>
                    <DrawerLink to="/edunote/school" className={expandableItem}>
                        <div className='flex gap-2'><BuildingLibraryIcon className={sizeIcon} /> Ecoles</div>
                    </DrawerLink>
                </li>

                <li>
                    <DrawerLink to="/edunote/academic-years" className={expandableItem}>
                        <div className='flex gap-2'><CalendarDaysIcon className={sizeIcon} /> Années scolaires</div>
                    </DrawerLink>
                </li>
                

                {/* --- PEDAGOGIE --- */}
                <p className={sectionTitle}>Pédagogie</p>
                
                <li>
                    <DrawerLink to="/edunote/skills" className={expandableItem}>
                        <div className='flex gap-2'><ClipboardDocumentListIcon className={sizeIcon} /> Compétences</div>
                    </DrawerLink>
                </li>


                {/* Directeurs avec sous-menu */}
                <li>
                    <div onClick={() => toggleSubMenu('director')} className={`${expandableItem} cursor-pointer`}>
                        <div className='flex gap-2'><BuildingLibraryIcon className={sizeIcon} /> Chefs d'établissements </div>
                        <ChevronRightIcon className={`h-3 w-3 transition-transform ${openMenu === 'director' ? 'rotate-90' : ''}`} />
                    </div>
                    {openMenu === 'director' && (
                        <div className={positionMenu}>
                            <NavLink to="/edunote/directors/list/active" className="hover:text-indigo-600 py-1 transition-colors">Liste des Responsables de cette annee</NavLink>
                            <NavLink to="/edunote/directors/list" className="hover:text-indigo-600 py-1 transition-colors">Liste de tous les responsables </NavLink>
                            <NavLink to="/edunote/directors/assign" className="hover:text-indigo-600 py-1 transition-colors">Affectations <i className='text-[9px]'>(Année active)</i> </NavLink>
                        </div>
                    )}
                </li>


                {/* Enseignants avec sous-menu */}
                <li>
                    <div onClick={() => toggleSubMenu('profs')} className={`${expandableItem} cursor-pointer`}>
                        <div className='flex gap-2'><UserIcon className={sizeIcon} /> Enseignants</div>
                        <ChevronRightIcon className={`h-3 w-3 transition-transform ${openMenu === 'profs' ? 'rotate-90' : ''}`} />
                    </div>
                    {openMenu === 'profs' && (
                        <div className={positionMenu}>
                            <NavLink to="/edunote/teachers/list" className="hover:text-indigo-600 py-1 transition-colors">Liste des enseignants</NavLink>
                            <NavLink to="/edunote/teachers/assign" className="hover:text-indigo-600 py-1 transition-colors">Affectations</NavLink>
                        </div>
                    )}
                </li>

                {/* --- RESULTATS --- */}
                <p className={sectionTitle}>Résultats & Suivi</p>
                <li>
                    <DrawerLink to="/edunote/validation" className={expandableItem}>
                        <div className='flex gap-2'><CheckBadgeIcon className={sizeIcon} /> Vérouillage des trimestres</div>
                    </DrawerLink>
                </li>
                <li>
                    <DrawerLink to="/edunote/bulletins" className={expandableItem}>
                        <div className='flex gap-2'><DocumentTextIcon className={sizeIcon} /> Bulletins</div>
                    </DrawerLink>
                </li>
                <li>
                    <DrawerLink to="/edunote/personnel" className={expandableItem}>
                        <div className='flex gap-2'><ShieldCheckIcon className={sizeIcon} /> Gestion du personnel</div>
                    </DrawerLink>
                </li>
            </ul>
            )}

            {/* Admin */}
            {isDirector && (
            <ul className="menu w-full text-xs space-y-1 pb-10">
                <h2 className='px-4 text-xl font-black text-slate-800 tracking-tight capsule'>
                    Espace Directeur
                </h2>

                {/* --- ANALYTIQUE --- */}
                <p className={sectionTitle}>Analytique</p>
                <li>
                    <DrawerLink to="/edunote/director/performances" className={expandableItem}>
                        <div className='flex gap-2'><ChartBarIcon className={sizeIcon} /> Taux de réussite</div>
                    </DrawerLink>
                </li>
                <li>
                    <DrawerLink to="/edunote/director/stats" className={expandableItem}>
                        <div className='flex gap-2'><ChartBarSquareIcon className={sizeIcon} /> Effectifs</div>
                    </DrawerLink>
                </li>

                {/* --- STRUCTURE --- */}
                <p className={sectionTitle}>Structure</p>

                <li>
                    <DrawerLink to="/edunote/directors/students/list" className={expandableItem}>
                        <div className='flex gap-2'><UserGroupIcon className={sizeIcon} /> Elèves</div>
                    </DrawerLink>
                </li>

                <li>
                    <DrawerLink to="/edunote/directors/teachers" className={expandableItem}>
                        <div className='flex gap-2'><UserIcon className={sizeIcon} /> Enseignants</div>
                    </DrawerLink>
                </li>
                
                {/* --- RESULTATS --- */}
                <p className={sectionTitle}>Résultats & Suivi</p>

                <li>
                    <DrawerLink to="/edunote/validation" className={expandableItem}>
                        <div className='flex gap-2'><CheckBadgeIcon className={sizeIcon} /> Vérouillage des trimestres</div>
                    </DrawerLink>
                </li>

                <li>
                    <DrawerLink to="/edunote/bulletins" className={expandableItem}>
                        <div className='flex gap-2'><DocumentTextIcon className={sizeIcon} /> Bulletins</div>
                    </DrawerLink>
                </li>
            </ul>
            )}

            {/* Enseignants */}
            {isTeacher && (
                <ul className="menu w-full text-xs space-y-1 pb-10">
                    <h2 className='px-4 text-xl font-black text-slate-800 tracking-tight capsule text-center'>
                        Espace Enseignant
                    </h2>
                    <ul className="menu w-full text-xs space-y-1 pb-10">

                        {/* --- ANALYTIQUE --- */}
                        <p className={sectionTitle}>Mon espace</p>
                        <li>
                            <DrawerLink to="/edunote/marks/hub" className={expandableItem}>
                                <div className='flex gap-2'><ChartBarIcon className={sizeIcon} /> Saisir les notes</div>
                            </DrawerLink>
                        </li>
                    </ul>
                    <div>
                        <img src='/gestion.webp' className='rounded-2xl' />
                    </div>
                </ul>
            )}
        </>
    )
}

export default NavbarAdmin