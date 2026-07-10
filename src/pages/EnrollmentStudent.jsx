import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { api } from '../utils/AxiosClient'
import { User, MapPin, Phone, GraduationCap, Calendar, Loader2, Sparkles, Hash, Camera } from 'lucide-react'
import convertToWebp from '../utils/imageToWebp'
import { toast } from 'sonner'
import InputComponent from '../components/InputComponent'
import { useHasRole } from '../hooks/UseHasRole'
import PageHeader from '../components/elements/PageHeader'

export default function EnrollmentStudent() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const isDirector = useHasRole('director')

  const { register, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      matricule: '',
      first_name: '',
      last_name: '',
      gender: '',
      birth_date: '',
      birth_place: '',
      contact: '',
      photo: '',
      classroom_id: '',
      school_id: ''
    }
  })

  const [selectedGender, setSelectedGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [classes, setClasses] = useState([])
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isDirector) {
      toast.error('Seul le directeur peut effectuer cette opération.')
      navigate('/403')
      return
    }

    let isMounted = true
    const loadData = async () => {
      setFetching(true)
      try {
        const [resC] = await Promise.all([api.get('/classrooms')])

        if (!isMounted) return
        setClasses(resC.data || [])

        if (isEditMode) {
          const { data } = await api.get(`/director-space/students/${id}`)
          const student = data.data

          reset({
            matricule: student.matricule || '',
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            gender: student.gender || '',
            birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
            birth_place: student.birth_place || '',
            contact: student.contact || '',
            photo: student.photo || '',
            school_id: student.enrollments?.[0]?.school_id?.toString() || '',
            classroom_id: student.enrollments?.[0]?.classroom_id?.toString() || ''
          })

          setSelectedGender(student.gender || '')

          if (student.photo) {
            setPreview(student.photo)
          }
        }
      } catch (error) {
        console.error(error)
        toast.error('Erreur de chargement')
      } finally {
        if (isMounted) {
          setFetching(false)
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [id, isEditMode, isDirector, navigate, reset])

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const oldPhotoUrl = getValues('photo')
    setUploading(true)
    setPreview(URL.createObjectURL(file))

    try {
      if (oldPhotoUrl && oldPhotoUrl.includes('http')) {
        await api.post('/delete-image', { url: oldPhotoUrl })
      }

      const webpFile = await convertToWebp(file, 1200, 0.8)
      const formData = new FormData()
      formData.append('file', webpFile)
      formData.append('folder', 'students')

      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setValue('photo', res.data.url)
      setPreview(res.data.url)
      toast.success('Photo mise à jour')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Erreur image')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data) => {
    if (uploading) return toast.info('Veuillez patienter...')

    setLoading(true)

    try {
      if (isEditMode) {
        await api.put(`/director-space/students/${id}`, data)
      } else {
        await api.post('/director-space/students/store', data)
      }
      toast.success('Enregistré avec succès !')
      navigate(-1)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  
  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      <PageHeader
        title={isEditMode ? 'Modifier les informations' : 'Inscription'}
        subtitle={isEditMode ? '' : 'Inscrire un nouvel élève dans le système'}
      />

      <section className="p-4 max-w-6xl mx-auto mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100">
              <h2 className="text-indigo-600 font-black text-[10px] uppercase mb-8 flex items-center gap-2">
                <Sparkles size={14} /> Identité
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputComponent
                    nom="Matricule"
                    name="matricule"
                    register={register}
                    errors={errors}
                    req={true}
                    type="text"
                    placeholder="MATRICULE"
                    icone={<Hash size={16} />}
                  />
                </div>
                <InputComponent
                  nom="Nom"
                  name="first_name"
                  register={register}
                  errors={errors}
                  req={true}
                  type="text"
                  placeholder="Nom"
                  icone={<User size={16} />}
                />
                <InputComponent
                  nom="Prénom"
                  name="last_name"
                  register={register}
                  errors={errors}
                  req={true}
                  type="text"
                  placeholder="Prénom"
                  icone={<User size={16} />}
                />
                <InputComponent
                  nom="Né le"
                  name="birth_date"
                  register={register}
                  errors={errors}
                  req={true}
                  type="date"
                  icone={<Calendar size={16} />}
                />
                <InputComponent
                  nom="À"
                  name="birth_place"
                  register={register}
                  errors={errors}
                  req={true}
                  type="text"
                  placeholder="Lieu"
                  icone={<MapPin size={16} />}
                />
              </div>
              <div className="mt-8">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Genre</label>
                <input type="hidden" {...register('gender', { required: 'Requis' })} />
                <div className="flex gap-4">
                  {['M', 'F'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setValue('gender', g, { shouldValidate: true })
                        setSelectedGender(g)
                      }}
                      className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                        selectedGender === g
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {g === 'M' ? 'GARÇON' : 'FILLE'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="relative w-40 h-40">
                <div className="w-full h-full rounded-[2.5rem] border-4 border-slate-50 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-slate-300" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </label>
              </div>
              <input type="hidden" {...register('photo')} />
            </div>

            <div className="bg-slate-900 p-8 rounded-4xl shadow-xl text-white">
              <h2 className="text-indigo-400 font-bold text-xs uppercase mb-6 flex items-center gap-2">
                <GraduationCap size={16} /> Scolarité
              </h2>
              <div className="space-y-4">
                <select
                  {...register('classroom_id', { required: 'Requis' })}
                  className="w-full p-4 rounded-2xl bg-slate-800 border-none text-white outline-none"
                >
                  <option value="">Classe...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="input-dark">
                  <InputComponent
                    nom="Contact Parent"
                    name="contact"
                    register={register}
                    errors={errors}
                    type="tel"
                    placeholder="6xx xxx xxx"
                    icone={<Phone size={16} />}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-6 rounded-4xl bg-indigo-600 text-white font-black text-[11px] tracking-[2px] shadow-xl hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-3 uppercase"
            >
              {loading ? <Loader2 className="animate-spin" /> : isEditMode ? 'Mettre à jour' : "Valider l'inscription"}
            </button>
          </div>
        </form>
      </section>

      <style>{`
        .input-dark input { background-color: #1e293b !important; color: white !important; border: 1px solid #334155 !important; border-radius: 1rem !important; }
        .input-dark label { color: #94a3b8 !important; }
      `}</style>
    </main>
  )
}
