import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosClient from '../../utils/AxiosClient'
import Navbar from '../../components/Navbar'
import BtnList from '../../components/BtnList'
import Loading from '../../components/Loading'
import AddBtn from '../../components/AddBtn'
import Table from '../../components/Table'
import Toggle from '../../components/Toggle'
import EditBtn from '../../components/EditBtn'
import DeleteBtn from '../../components/DeleteBtn'
import useShowConfirm from '../../hooks/UseShowConfirm'
import ModalComponent from '../../components/ModalComponent'
import TrComponent from '../../components/TrComponent'
import TdComponent from '../../components/TdComponent'

function AcademicYear() {
    const [year, setYear] = useState([])
    const [activeYear, setActiveYear] = useState(null)
    const [loading, setLoading] = useState(false)
    const showConfirm = useShowConfirm()
    
    // États pour la modale et le formulaire
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentYear, setCurrentYear] = useState({ id: null, name: '' })

    const fetchYears = async () => {
        setLoading(true)
        axiosClient.get('/academic-years')
            .then(({ data }) => {
                setYear(data.data)
                setActiveYear(data.active_year)
            })
            .catch((error) => toast.error("Erreur de chargement"))
            .finally(() => setLoading(false))
    }

    // Ouvrir la modale (vide pour ajout, remplie pour modif)
    const openModal = (data = { id: null, name: '' }) => {
        setCurrentYear(data)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        const promise = currentYear.id 
            ? axiosClient.put(`/academic-years/${currentYear.id}`, currentYear) // Update
            : axiosClient.post('/academic-years', currentYear) // Create

        promise
            .then(() => {
                toast.success(currentYear.id ? "Année modifiée" : "Année ajoutée")
                setIsModalOpen(false)
                fetchYears()
            })
            .catch((err) => toast.error("Erreur de sauvegarde"))
            .finally(() => setLoading(false))
    }

    const handleToggleChange = async (id, isChecked) => {
        setLoading(true)
        axiosClient.post(`/academic-years/${id}/toggle`, { is_active: isChecked })
            .then(() => {
                toast.success(`Année ${isChecked ? 'activée' : 'désactivée'}`)
                fetchYears()
            })
            .catch((error) => toast.error("Erreur de mise à jour"))
            .finally(() => setLoading(false))
    }

    const handleDelete = (id) => {
        showConfirm({
            title: "Supprimer",
            message: `Voulez-vous vraiment supprimer cet Année scolaire ?`,
            onSuccess: async () => {
                setLoading(true)
                axiosClient.delete(`/academic-years/${id}`)
                    .then(() => {
                        toast.success("Année supprimée")
                        fetchYears()
                    })
                    .catch((error) => toast.error("Erreur de suppression"))
                    .finally(() => setLoading(false))
            },
            onError: () => {
                toast.info("Merci d'avoir changé d'avis 😊");
            }
        });       
    }

    useEffect(() => { fetchYears() }, [])

    return (
        <main>
            <Navbar>
                <Navbar.Left>
                    <AddBtn action={() => openModal()} />
                </Navbar.Left>

                <Navbar.Center>
                    <div>
                        <h1 className="text-sm font-bold text-center">Années Académiques</h1>
                        <h1 className="text-sm font-bold text-center text-green-600">{activeYear?.name}</h1>
                    </div>
                </Navbar.Center>

                <Navbar.Right>
                    <Loading load={loading} />
                    <BtnList action={fetchYears} />
                </Navbar.Right>
            </Navbar>

            {/* MODALE D'AJOUT / MODIFICATION */}
            {isModalOpen && (
                <ModalComponent>
                    <ModalComponent.Title>
                        {currentYear.id ? 'Modifier l\'année' : 'Nouvelle année'}
                    </ModalComponent.Title>

                    <ModalComponent.Body>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Ex: 2023-2024"
                                className="input input-bordered w-full mb-4"
                                value={currentYear.name}
                                onChange={(e) => setCurrentYear({...currentYear, name: e.target.value})}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm">Annuler</button>
                                <button type="submit" className="btn btn-primary btn-sm">Enregistrer</button>
                            </div>
                        </form>
                    </ModalComponent.Body>

                </ModalComponent>
            )}

            <section className="p-4">
                {
                    year.length > 0 ? (
                        <Table>
                            <Table.Head>
                                <th className='font-bold'>#</th>
                                <th>Année</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </Table.Head>
                            <Table.Body>
                                {year?.map((yr, index) => (
                                    <TrComponent key={yr.id}>
                                        <TdComponent>{index + 1}</TdComponent>
                                        <TdComponent className='font-bold'>{yr.name}</TdComponent>
                                        <TdComponent>
                                            <Toggle
                                                checked={yr.is_active}
                                                onChange={(isChecked) => handleToggleChange(yr.id, isChecked)}
                                            />
                                        </TdComponent>
                                        <TdComponent className="flex gap-2">
                                            <EditBtn text={'Modifier'} action={() => openModal(yr)} />
                                            <DeleteBtn text={'Supprimer'} action={() => handleDelete(yr.id)} />
                                        </TdComponent>
                                    </TrComponent>
                                ))}
                            </Table.Body>
                        </Table>
                    ) : (
                        <p className="text-center text-gray-500">Aucune année académique trouvée.</p>
                    )
                }
            </section>
        </main>
    )
}

export default AcademicYear