import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import BtnList from '../components/BtnList'
import Loading from '../components/Loading'
import TitleComponent from '../components/TitleComponent'
import AddBtn from '../components/AddBtn'
import LoadingSkeletoon from '../components/LoadingSkeletoon'
import Table from '../components/Table'
import axiosClient from '../utils/AxiosClient'
import BadgeRole from '../components/BadgeRole'
import Paginate from '../components/Paginate'
import { useNavigate } from 'react-router-dom'
import TrComponent from '../components/TrComponent'
import TdComponent from '../components/TdComponent'
import EditBtn from '../components/EditBtn'
import DeleteBtn from '../components/DeleteBtn'
import useShowConfirm from '../hooks/UseShowConfirm'
import { toast } from 'react-toastify'

function Personnel() {
    const [loading, setLoading] = useState(false);
    const [personnels, setPersonnels] = useState([]);
    const navigate = useNavigate()
    const showConfirm = useShowConfirm()
    
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // --- Nouveaux états pour les filtres ---
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [availableRoles, setAvailableRoles] = useState([]);
    // ... autres states

    const fetchPersonnels = async (page = 1) => {
        setLoading(true);
        // On utilise les valeurs actuelles de search et roleFilter
        const params = new URLSearchParams({
            page: page,
            search: search, 
            role: roleFilter
        }).toString();

        axiosClient.get(`/personnels?${params}`)
            .then(({data}) => {
                setPersonnels(data.data);
                setLastPage(data.last_page || data.meta?.last_page || 1);
                setCurrentPage(page);
            })
            .finally(() => setLoading(false));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPersonnels(1);
    }

    const handlePageChange = (page) => {
        fetchPersonnels(page);
        window.scrollTo(0, 0);
    }

    // LOGIQUE DE DEBOUNCE
    useEffect(() => {

        axiosClient.get('/roles').then(({data}) => {
            setAvailableRoles(data);
        });
        // On crée un timer
        const delayDebounceFn = setTimeout(() => {
            fetchPersonnels(1);
        }, 500); // Attend 500ms après la dernière frappe

        // On nettoie le timer si l'utilisateur tape une nouvelle lettre avant la fin des 500ms
        return () => clearTimeout(delayDebounceFn);
    }, [search, roleFilter]); // S'exécute quand la recherche ou le filtre change

    

    const handleDelete = (id) => {
        showConfirm({
            title:"Supprimer un utilisateur",
            message: "Voulez-vous supprimer cette personne ?",
            onSuccess: () => {
                axiosClient.delete(`/personnels/${id}`)
                .then(({data}) => {
                    toast.success(data?.message)
                    fetchPersonnels()
                })
            },
            onError: () => {
                toast.info("Suppression annulée")
            }
        })
    }

  return (
    <main>
        <Navbar>
            <Navbar.Left>
                <AddBtn action={() => navigate('/edunote/create-personnel')} />
            </Navbar.Left>

            <Navbar.Center>
                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg px-3">
                    {/* Champ Recherche */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Nom, email..." 
                            className="input input-ghost input-sm focus:bg-slate-100 border-none outline-none w-40 md:w-60"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="h-6 w-1 bg-slate-300"></div>

                    {/* Sélecteur Rôle */}
                    <select 
                        className="select bg-slate-100 border-none outline-none select-sm"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">Tous les rôles</option>
                        {availableRoles.map((role) => (
                            // Si vous n'avez vraiment pas d'ID, utilisez role.name comme key
                            <option key={role.id || role.name} value={role.name}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>
            </Navbar.Center>

            <Navbar.Right>
                <Loading load={loading} />
                <BtnList action={() => fetchPersonnels(currentPage)} />
            </Navbar.Right>
        </Navbar>

        {/* Reste du tableau identique ... */}
        {loading ? (<LoadingSkeletoon />) : (
                <section className='p-4'>
                    {personnels.length === 0 ? (
                        <div className='flex flex-col items-center justify-center mt-20 text-slate-500 font-semibold'>
                            Aucun personnel trouvé.
                        </div>
                    ) : (
                        <>
                            <Table size={'xs'}>
                                <Table.Head>
                                    <th>#</th>
                                    <th>Noms</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Actions</th>
                                </Table.Head>
                                <Table.Body>
                                    {personnels.map((personnel, index) => (
                                        <TrComponent key={personnel.id}>
                                            <TdComponent>{index + 1}</TdComponent>
                                            <TdComponent>{personnel.first_name} {personnel.last_name}</TdComponent>
                                            <TdComponent><a href={`tel:${personnel.phone}`}>{personnel.phone}</a></TdComponent>
                                            <TdComponent><a href={`mailto:${personnel.email}`}>{personnel.email}</a></TdComponent>
                                            <TdComponent className="flex gap-1">
                                                {personnel?.roles?.map((role) => (
                                                    <BadgeRole key={role.id} role={role.name} />
                                                ))}
                                            </TdComponent>
                                            <TdComponent>
                                                <EditBtn action={() => {navigate(`/edunote/create-personnel/${personnel.id}`)}} />
                                                <DeleteBtn action={() => {handleDelete(personnel.id)}} />
                                            </TdComponent>
                                        </TrComponent>
                                    ))}
                                </Table.Body>
                            </Table>

                            <div className="flex justify-center mt-6">
                                <Paginate 
                                    currentPage={currentPage}
                                    lastPage={lastPage}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </section>
            )}
    </main>
  )
}

export default Personnel