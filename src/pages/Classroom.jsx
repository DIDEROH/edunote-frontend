import { useEffect, useState } from "react"
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { api } from "../utils/AxiosClient"
import { toast } from "sonner"
import { BookOpenCheck, Save, X } from "lucide-react"

import LoadingSkeletoon from "../components/LoadingSkeletoon"
import { EditBtn, DeleteBtn, CtaDark, CtaNeon, InfoBtn } from "../components/ui/ButtonsComponents"
import useShowConfirm from "../hooks/UseShowConfirm"
import { Table, Th, Tr, TdBody } from "../components/Table"
import PageHeader from "../components/elements/PageHeader"
import { Card5 } from "../components/ui/CardsComponents"
import { LuSearchX } from "react-icons/lu"
import { deleteElement } from "../utils/deleteElement"
import InputComponent from "../components/InputComponent"

// Composant Formulaire dédié
const ClassroomForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || {}
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white border border-slate-100 shadow-sm rounded-sm max-w-4xl mx-auto">
            <h2 className="text-lg font-bold mb-6">{initialData ? "Modifier la classe" : "Ajouter une classe"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputComponent nom="Nom" name="name" register={register} errors={errors} req={true} />
                <InputComponent nom="Pseudo" name="short_name" register={register} errors={errors} req={true} />
                <InputComponent nom="Niveau" name="level_index" register={register} errors={errors} req={true} />
                <InputComponent nom="Cycle" name="cycle" register={register} errors={errors} req={true} />
            </div>
            <div className="flex gap-4 mt-6">
                <CtaDark onAction={onCancel} icon={X}> Annuler</CtaDark>
                <CtaNeon disabled={loading} type="submit" icon={Save}>
                  {loading ? "Chargement..." : "Enregistrer"}
                </CtaNeon>
            </div>
        </form>
    );
};

function Classroom() {
    const [view, setView] = useState('list')
    const [loading, setLoading] = useState(false)
    const [classrooms, setClassrooms] = useState([])
    const [currentClassroom, setCurrentClassroom] = useState(null)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    
    const showConfirm = useShowConfirm()
    const navigate = useNavigate()
    const { setNavbarActions } = useOutletContext();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    const fetchClassrooms = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/classrooms', { params: debouncedSearch ? { search: debouncedSearch } : {} })
            setClassrooms(Array.isArray(data) ? data : (data.data || []))
        } catch {
            toast.error("Erreur de chargement")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchClassrooms() }, [debouncedSearch])

    const handleFormSubmit = async (data) => {
        setLoading(true)
        try {
            if (view === 'edit') {
                await api.put(`/classrooms/${currentClassroom.id}`, data)
                toast.success("Classe mise à jour")
            } else {
                await api.post('/classrooms', data)
                toast.success("Classe ajoutée")
            }
            setView('list')
            fetchClassrooms()
        } catch {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setLoading(false)
        }
    }

    const onDelete = (id) => {
        deleteElement('classrooms', id, 'cette classe', showConfirm, {
            onStart: () => setLoading(true),
            onSuccess: () => fetchClassrooms(),
            onFinally: () => setLoading(false)
        })
    }

    useEffect(() => {
        setNavbarActions({ onAdd: () => setView('add') })
        return () => setNavbarActions({})
    }, [setNavbarActions])

    return (
        <main className='text-xs'>
            <PageHeader title="Gestion des classes" subtitle="Configuration des salles" onSearch={setSearch} />
            
            <section className="p-4">
                {view !== 'list' ? (
                    <ClassroomForm 
                        initialData={currentClassroom} 
                        onSubmit={handleFormSubmit} 
                        onCancel={() => setView('list')} 
                        loading={loading} 
                    />
                ) : loading ? <LoadingSkeletoon /> : classrooms.length === 0 ? (
                    <Card5 icon={LuSearchX}> Aucune classe trouvée.</Card5>
                ) : (
                    <Table>
                        <Table.Head>
                            <Th>#</Th><Th>Nom</Th><Th>Pseudo</Th><Th>Niveau</Th><Th>Cycle</Th><Th>Actions</Th>
                        </Table.Head>
                        <Table.Body>
                            {classrooms.map((s, index) => (
                                <Tr key={s.id}>
                                    <TdBody className="font-bold">{index + 1}</TdBody>
                                    <TdBody>{s.name}</TdBody>
                                    <TdBody>{s.short_name}</TdBody>
                                    <TdBody>{s.level_index}</TdBody>
                                    <TdBody>{s.cycle}</TdBody>
                                    <TdBody>
                                        <div className="flex gap-1">
                                            <EditBtn onAction={() => { setCurrentClassroom(s); setView('edit'); }} />
                                            <DeleteBtn onAction={() => onDelete(s.id)} />
                                            <InfoBtn onAction={() => navigate(`/classrooms/${s.id}`)} />
                                        </div>
                                    </TdBody>
                                </Tr>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </section>
        </main>
    )
}

export default Classroom