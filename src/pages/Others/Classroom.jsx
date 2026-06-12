import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import AddBtn from "../../components/AddBtn"
import Loading from "../../components/Loading"
import BtnList from "../../components/BtnList"
import LoadingSkeletoon from "../../components/LoadingSkeletoon"
import axiosClient from "../../utils/AxiosClient"
import Table from "../../components/Table"
import EditBtn from "../../components/EditBtn"
import DeleteBtn from "../../components/DeleteBtn"
import Swal from "sweetalert2" // Optionnel: pour des alertes plus jolies
import useShowConfirm from "../../hooks/UseShowConfirm"
import { toast } from "react-toastify"
import TrComponent from "../../components/TrComponent"
import TdComponent from "../../components/TdComponent"
import { BookOpenCheck } from "lucide-react"
import { useNavigate } from 'react-router-dom'

function Classroom() {
  const [loading, setLoading] = useState(false)
  const [classrooms, setClassrooms] = useState([])
  const showConfirm = useShowConfirm()
  const navigate = useNavigate()

  // --- 1. FONCTION DE RÉCUPÉRATION ---
  const fetchClassrooms = () => {
    setLoading(true)
    axiosClient.get('/classrooms')
      .then(({ data }) => {
        // Si votre API renvoie { data: [...] }, utilisez data.data
        setClassrooms(Array.isArray(data) ? data : data.data)
      })
      .catch((err) => console.error("Erreur lors du chargement:", err))
      .finally(() => setLoading(false))
  }

  // --- 2. AJOUTER UNE CLASSE ---
  const handleAddClassroom = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Ajouter une classe',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nom (ex: Terminale D)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Pseudo (ex: TleD)">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          short_name: document.getElementById('swal-input2').value
        }
      }
    })

    if (formValues && formValues.name && formValues.short_name) {
      setLoading(true)
      axiosClient.post('/classrooms', formValues)
        .then(() => {
          fetchClassrooms()
          Swal.fire('Succès', 'Classe ajoutée', 'success')
        })
        .catch(err => Swal.fire('Erreur', 'Vérifiez les données (doublon ?)', 'error'))
        .finally(() => setLoading(false))
    }
  }

  // --- 3. MODIFIER UNE CLASSE ---
  const onEdit = async (classroom) => {
    const { value: formValues } = await Swal.fire({
      title: 'Modifier la classe',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Nom" value="${classroom.name}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Pseudo" value="${classroom.short_name}">`,
      showCancelButton: true,
      preConfirm: () => {
        return {
          name: document.getElementById('swal-input1').value,
          short_name: document.getElementById('swal-input2').value
        }
      }
    })

    if (formValues) {
      setLoading(true)
      axiosClient.put(`/classrooms/${classroom.id}`, formValues)
        .then(() => {
          fetchClassrooms()
          Swal.fire('Mis à jour !', '', 'success')
        })
        .catch(() => Swal.fire('Erreur', 'Modification impossible', 'error'))
        .finally(() => setLoading(false))
    }
  }

  // --- 4. SUPPRIMER UNE CLASSE ---
  const onDelete = (id) => {

    showConfirm({
        title: "Supprimer",
        message: `Voulez-vous vraiment supprimer cet Année scolaire ?`,
        onSuccess: async () => {
            setLoading(true)
            axiosClient.delete(`/classrooms/${id}`)
              .then(() => {
                setClassrooms(classrooms.filter(c => c.id !== id))
                toast.success("Supprimé avec succès")
              })
              .catch(() => toast.error("Erreur lors de la suppression"))
              .finally(() => setLoading(false))
            
        },
        onError: () => {
            toast.info("Merci d'avoir changé d'avis 😊");
        }
    }); 

  }

  useEffect(() => {
    fetchClassrooms()
  }, [])

  return (
    <main className='text-xs'>
      <Navbar>
        <Navbar.Left>
          <AddBtn action={handleAddClassroom} />
        </Navbar.Left>
        <Navbar.Right>
          <Loading load={loading} />
          <BtnList action={fetchClassrooms} />
        </Navbar.Right>
      </Navbar>

      {loading && classrooms.length === 0 ? (
        <LoadingSkeletoon />
      ) : (
        <section className="p-4">
          {classrooms.length === 0 ? (
            <div className="alert alert-warning">⚠️ Aucune classe trouvée</div>
          ) : (
            <Table>
              <Table.Head>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Pseudo</th>
                  <th>Niveau</th>
                  <th>Cycle</th>
                  <th className="font-bold">Actions</th>
              </Table.Head>
              <Table.Body>
                {classrooms.map((s, index) => (
                  <TrComponent key={s.id}>
                    <TdComponent className="font-bold">{index + 1}</TdComponent>
                    <TdComponent>{s?.name}</TdComponent>
                    <TdComponent>{s?.short_name}</TdComponent>
                    <TdComponent><span className="badge badge-ghost">{s?.level_index}</span></TdComponent>
                    <TdComponent>{s?.cycle}</TdComponent>
                    <TdComponent>
                      <div className="flex gap-1">
                        <EditBtn action={() => onEdit(s)} />
                        <DeleteBtn action={() => onDelete(s.id)} />
                        <button className="btn btn-ghost btn-xs btn-circle text-info tooltip tooltip-left" data-tip="Ajouter des matières" onClick={() => {navigate(`/edunote/classroom/assign/${s.id}`)}} >
                          <BookOpenCheck size={14} />
                        </button>
                      </div>
                    </TdComponent>
                  </TrComponent>
                ))}
              </Table.Body>
            </Table>
          )}
        </section>
      )}
    </main>
  )
}

export default Classroom