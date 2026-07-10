import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { api } from '../utils/AxiosClient'
import { Table, TdBody, Th, Tr } from '../components/Table'
import { DeleteBtn, EditBtn } from '../components/ui/ButtonsComponents'
import Toggle from '../components/Toggle'
import useShowConfirm from '../hooks/UseShowConfirm'
import ModalComponent from '../components/ModalComponent'
import PageHeader from '../components/elements/PageHeader'
import LoadingSkeletoon from '../components/LoadingSkeletoon'
import { Card5 } from '../components/ui/CardsComponents'
import { LuSearchX } from 'react-icons/lu'
import { deleteElement } from '../utils/deleteElement'

function AcademicYear() {
    const { setNavbarActions } = useOutletContext()
    const navigate = useNavigate();
    const [year, setYear] = useState([]);
    const [activeYear, setActiveYear] = useState(null);
    const [loading, setLoading] = useState(false);
    const showConfirm = useShowConfirm();
    


    // États pour la modale et le formulaire
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentYear, setCurrentYear] = useState({ id: null, name: ''})

    const fetchYears = async () => {
        setLoading(true)
        api.get('/academic-years')
            .then(({ data }) => {
                setYear(data.data)
                setActiveYear(data.active_year)
            })
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
            ? api.put(`/academic-years/${currentYear.id}`, currentYear) // Update
            : api.post('/academic-years', currentYear) // Create

        promise 
            .then(() => {
                toast.success(currentYear.id ? "Année modifiée" : "Année ajoutée")
                setIsModalOpen(false)
                fetchYears()
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false))
    }

    const handleToggleChange = async (id, isChecked) => {
        setLoading(true)
        api.patch(`/academic-years/${id}/activate`, { is_active: isChecked })
            .then(() => {
                toast.success(`Année ${isChecked ? 'activée' : 'désactivée'}`)
                fetchYears()
            })
            .catch((error) => toast.error("Erreur de mise à jour"))
            .finally(() => setLoading(false))
    }

    const handleDelete = (id) => {
        deleteElement(
            'academic-years',
            id,
            'cette année scolaire',
            showConfirm,
            {
                onStart: () => setLoading(true),
                onSuccess: () => {
                    fetchYears()
                },
                onFinally: () => setLoading(false)
            }
        )
    }

    useEffect(() => {
        fetchYears();

        setNavbarActions({
            onBack: () => navigate(-1),
            onAdd: () => setIsModalOpen(true    )
        });
        return () => setNavbarActions({});
    }, [setNavbarActions])

    return (
        <div>
            <PageHeader
                title='Gestion des Années academiques'
                subtitle='Modifiez, supprimez, activez ou desactivez une année'
            />

        

            {/* MODALE D'AJOUT / MODIFICATION */}
            {   isModalOpen && (
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
                {loading ? <LoadingSkeletoon /> : year.length == 0 ? (
                    <Card5 icon={LuSearchX}> Aucune année académique trouvée. </Card5>
                    ) : (
                        <Table>
                            <Table.Head>
                                <Th className='font-bold'>#</Th>
                                <Th>Année</Th>
                                <Th>Statut</Th>
                                <Th>Actions</Th>
                            </Table.Head>
                            <Table.Body>
                                {year?.map((yr, index) => (
                                    <Tr key={yr.id}>
                                        <TdBody>{index + 1}</TdBody>
                                        <TdBody className='font-bold'>{yr.name}</TdBody>
                                        <TdBody>
                                            <Toggle
                                                checked={yr.is_active}
                                                onChange={(isChecked) => handleToggleChange(yr.id, isChecked)}
                                            />
                                        </TdBody>
                                        <TdBody className="flex gap-2">
                                            <EditBtn text={'Modifier'} onAction={() => openModal(yr)} />
                                            <DeleteBtn text={'Supprimer'} onAction={() => handleDelete(yr.id)} />
                                        </TdBody>
                                    </Tr>
                                ))}
                            </Table.Body>
                        </Table>
                    )
                }
            </section>
        </div>
    )
}

export default AcademicYear