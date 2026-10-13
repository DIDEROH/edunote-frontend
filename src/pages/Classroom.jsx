import { useEffect, useState } from "react"
import { useOutletContext } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { api } from "../utils/AxiosClient"
import { toast } from "sonner"
import { BookOpenCheck, Info, Save, X } from "lucide-react"

import LoadingSkeletoon from "../components/LoadingSkeletoon"
import { EditBtn, DeleteBtn, CtaDark, CtaNeon } from "../components/ui/ButtonsComponents"
import useShowConfirm from "../hooks/UseShowConfirm"
import { Table, Th, Tr, TdBody } from "../components/Table"
import PageHeader from "../components/elements/PageHeader"
import { Card5 } from "../components/ui/CardsComponents"
import { LuSearchX } from "react-icons/lu"
import { deleteElement } from "../utils/deleteElement"
import InputComponent from "../components/InputComponent"
import usePrintable from "../utils/usePrintable"
import PrintableTable from "../components/print/PrintableTable"
import useNavbarRefresh from "../hooks/useNavbarRefresh"

// Composant Formulaire dédié
const ClassroomForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData || {}
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-base-200 rounded-md max-w-4xl mx-auto">
            <h2 className="text-base font-semibold text-base-content mb-6">{initialData ? "Modifier la classe" : "Ajouter une classe"}</h2>
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
    const { setNavbarActions } = useOutletContext();
    const { printRef, print } = usePrintable("Liste des classes");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    // silent : actualisation depuis la barre du haut, la liste reste affichée
    const fetchClassrooms = async ({ silent = false } = {}) => {
        if (!silent) setLoading(true)
        try {
            const { data } = await api.get('/classrooms', { params: debouncedSearch ? { search: debouncedSearch } : {} })
            setClassrooms(Array.isArray(data) ? data : (data.data || []))
        } catch {
            toast.error("Erreur de chargement")
        } finally {
            if (!silent) setLoading(false)
        }
    }

    useEffect(() => { fetchClassrooms() }, [debouncedSearch])

    // Actualiser la liste (pas pendant la saisie du formulaire)
    useNavbarRefresh(view === 'list' ? () => fetchClassrooms({ silent: true }) : null)

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
        } catch (error) {
            toast.error(error.message || "Erreur lors de la sauvegarde")
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
        // 🐛 On vide la classe courante : sinon le formulaire d'ajout reprenait la dernière classe modifiée
        setNavbarActions({ onAdd: () => { setCurrentClassroom(null); setView('add'); }, onPrint: print })
        return () => setNavbarActions({})
    }, [setNavbarActions, print])

    return (
        <main className='text-xs'>
            <PrintableTable
                ref={printRef}
                title="Liste des classes"
                meta={[{ label: "Total", value: classrooms.length }]}
                columns={[
                    { key: "index", label: "#" },
                    { key: "name", label: "Nom" },
                    { key: "short_name", label: "Pseudo" },
                    { key: "level_index", label: "Niveau" },
                    { key: "cycle", label: "Cycle" },
                ]}
                rows={classrooms.map((c, index) => ({ id: c.id, index: index + 1, ...c }))}
            />

            <PageHeader title="Catalogue des classes" subtitle="Liste commune dans laquelle chaque établissement choisit ses classes" onSearch={setSearch} />

            {/* Les matières et coefficients ne sont plus communs : chaque école les configure */}
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-md bg-primary/10 p-4 text-sm text-base-content/70">
                <Info size={16} className="mt-0.5 shrink-0 text-primary" />
                <p>
                    Chaque établissement choisit ses classes dans ce catalogue, puis définit lui-même les matières
                    enseignées et leurs coefficients (Écoles → fiche de l'école, ou « Classes et matières » pour un directeur).
                </p>
            </div>

            <section className="p-4">
                {view !== 'list' ? (
                    <ClassroomForm
                        key={currentClassroom?.id || 'new'}
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