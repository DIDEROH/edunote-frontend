import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Navbar from '../../components/Navbar'
import BackComponent from '../../components/BackComponent'
import axiosClient from '../../utils/AxiosClient'
import { User, MapPin, Phone, GraduationCap, Calendar, Loader2, Sparkles, Hash, Camera, X, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import InputComponent from '../../components/InputComponent'

function DirectorEnrollmentStudent() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: { gender: '', photo: '', matricule: '' }
  });

  const selectedGender = watch("gender");
  const matricule = watch("matricule");

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [classes, setClasses] = useState([])
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setFetching(true)
      try {
        // On ne récupère que les classes (l'école est gérée par le token directeur)
        const resC = await axiosClient.get('/classrooms');
        if (!isMounted) return;
        setClasses(resC.data);

        if (isEditMode) {
          // On utilise le endpoint directeur pour la récupération
          const { data } = await axiosClient.get(`/director-space/students/${id}`);
          const s = data.data;
          reset({
            matricule: s.matricule || '',
            first_name: s.first_name || '',
            last_name: s.last_name || '',
            gender: s.gender || '',
            birth_date: s.birth_date ? s.birth_date.split('T')[0] : '',
            birth_place: s.birth_place || '',
            contact: s.contact || '',
            photo: s.photo || '',
            classroom_id: s.enrollments?.[0]?.classroom_id?.toString() || '',
          });
          if(s.photo) setPreview(s.photo);
        }
      } catch (err) { toast.error("Erreur de chargement"); }
      finally { if (isMounted) setFetching(false); }
    };
    loadData();
    return () => { isMounted = false };
  }, [id, isEditMode, reset]);

  // LOGIQUE DE COMPRESSION (Identique à ton code original)
  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 600; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            const fileName = `${matricule || 'temp'}_${Date.now()}.webp`;
            resolve(new File([blob], fileName, { type: 'image/webp' }));
          }, 'image/webp', 0.8);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const oldPhotoUrl = watch("photo");
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
        if (oldPhotoUrl && oldPhotoUrl.includes('http')) {
            await axiosClient.post('/delete-image', { url: oldPhotoUrl });
        }
        const webpFile = await processImage(file);
        const formData = new FormData();
        formData.append('file', webpFile);
        formData.append('folder', 'students');
        const res = await axiosClient.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setValue("photo", res.data.url);
        toast.success("Photo mise à jour");
    } catch (err) {
        toast.error("Erreur image");
    } finally { setUploading(false); }
  };

  const onSubmit = async (data) => {
    if(uploading) return toast.info("Attendez la photo...");
    setLoading(true);
    try {
      // APPEL AUX ROUTES DIRECTOR-SPACE
      const apiCall = isEditMode 
        ? axiosClient.put(`/director-space/students/${id}`, data) 
        : axiosClient.post('/director-space/students/store', data);
      await apiCall;
      toast.success("Élève enregistré dans votre école !");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur enregistrement");
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar>
        <Navbar.Left>
            <div className="flex flex-col">
                <h1 className='font-black text-xl text-slate-800 uppercase tracking-tight'>{isEditMode ? "Édition Élève" : "Nouvel Élève"}</h1>
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-widest"><ShieldCheck size={12}/> Mon Établissement</span>
            </div>
        </Navbar.Left>
        <Navbar.Right><BackComponent /></Navbar.Right>
      </Navbar>

      <section className="p-4 max-w-6xl mx-auto mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h2 className="text-indigo-600 font-black text-[10px] uppercase mb-8 flex items-center gap-2 tracking-[2px]"><Sparkles size={14}/> Informations d'Identité</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <InputComponent nom="Matricule Interne" name="matricule" register={register} errors={errors} req={true} type="text" placeholder="EX: 2026-ABC-001" icone={<Hash size={16}/>} />
                </div>
                <InputComponent nom="Nom" name="first_name" register={register} errors={errors} req={true} type="text" placeholder="Nom de l'élève" icone={<User size={16}/>} />
                <InputComponent nom="Prénom" name="last_name" register={register} errors={errors} req={true} type="text" placeholder="Prénom de l'élève" icone={<User size={16}/>} />
                <InputComponent nom="Date de naissance" name="birth_date" register={register} errors={errors} req={true} type="date" icone={<Calendar size={16}/>} />
                <InputComponent nom="Lieu de naissance" name="birth_place" register={register} errors={errors} req={true} type="text" placeholder="Lieu" icone={<MapPin size={16}/>} />
              </div>

              <div className="mt-8">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest">Genre / Sexe</label>
                <input type="hidden" {...register("gender", { required: "Requis" })} />
                <div className="flex gap-4">
                  {['M', 'F'].map(g => (
                    <button key={g} type="button" onClick={() => setValue("gender", g, { shouldValidate: true })}
                      className={`flex-1 py-5 rounded-2xl border-2 font-black transition-all text-xs tracking-widest ${selectedGender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}>
                      {g === 'M' ? 'MASCULIN' : 'FÉMININ'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-6">
            {/* PHOTO SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="relative w-44 h-44">
                <div className="w-full h-full rounded-[3rem] border-8 border-slate-50 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
                  {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={48} className="text-slate-200" />}
                </div>
                <label className="absolute -bottom-2 -right-2 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                </label>
                {preview && <button type="button" onClick={() => {setPreview(null); setValue("photo", "");}} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg"><X size={16} /></button>}
              </div>
              <input type="hidden" {...register("photo")} />
              <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photo Officielle</p>
            </div>

            {/* SCOLARITÉ SECTION */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
              <h2 className="text-indigo-400 font-black text-[10px] uppercase mb-6 flex items-center gap-2 tracking-[2px]"><GraduationCap size={16}/> Affectation de Classe</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Classe de l'élève</label>
                    <select {...register("classroom_id", { required: "Requis" })} className="w-full p-5 rounded-2xl bg-slate-800 border-none text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                    <option value="">Sélectionner une classe...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="input-dark">
                  <InputComponent nom="Téléphone Parent" name="contact" register={register} errors={errors} type="tel" placeholder="6xx xxx xxx" icone={<Phone size={16}/>} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || uploading} className="w-full py-6 rounded-[2.5rem] bg-indigo-600 text-white font-black text-xs tracking-[3px] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : (isEditMode ? "METTRE À JOUR LE PROFIL" : "CONFIRMER L'INSCRIPTION")}
            </button>
          </div>
        </form>
      </section>

      <style>{`
        .input-dark input { background-color: #1e293b !important; color: white !important; border: 1px solid #334155 !important; border-radius: 1.25rem !important; padding: 1.25rem !important; }
        .input-dark label { color: #64748b !important; font-weight: 800 !important; font-size: 10px !important; text-transform: uppercase !important; letter-spacing: 1px !important; }
      `}</style>
    </main>
  )
}

export default DirectorEnrollmentStudent;