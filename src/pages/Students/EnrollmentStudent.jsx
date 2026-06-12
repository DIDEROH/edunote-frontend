import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Navbar from '../../components/Navbar'
import BackComponent from '../../components/BackComponent'
import axiosClient from '../../utils/AxiosClient'
import { User, MapPin, Phone, GraduationCap, Calendar, Loader2, Sparkles, Hash, Camera, X, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import InputComponent from '../../components/InputComponent'
import { useHasRole } from '../../hooks/UseHasRole' // Import de ton hook

function EnrollmentStudent() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  
  // 1. Détection du rôle
  const isAdmin = useHasRole('Admin')
  const isDirector = useHasRole('Director')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: { gender: '', photo: '', matricule: '' }
  });

  const selectedGender = watch("gender");
  const matricule = watch("matricule");

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [schools, setSchools] = useState([])
  const [classes, setClasses] = useState([])
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setFetching(true)
      try {
        // 2. Chargement conditionnel des écoles (uniquement pour l'Admin)
        const requests = [axiosClient.get('/classrooms')];
        if (isAdmin) requests.push(axiosClient.get('/schools'));

        const [resC, resS] = await Promise.all(requests);
        
        if (!isMounted) return;
        setClasses(resC.data);
        if (isAdmin) setSchools(resS.data);

        if (isEditMode) {
          // 3. URL de récupération selon le rôle
          const fetchUrl = isAdmin ? `/student-enrollments/${id}` : `/director-space/students/${id}`;
          const { data } = await axiosClient.get(fetchUrl);
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
            school_id: s.enrollments?.[0]?.school_id?.toString() || '',
            classroom_id: s.enrollments?.[0]?.classroom_id?.toString() || '',
          });
          if(s.photo) setPreview(s.photo);
        }
      } catch (err) { toast.error("Erreur de chargement"); }
      finally { if (isMounted) setFetching(false); }
    };
    loadData();
    return () => { isMounted = false };
  }, [id, isEditMode, reset, isAdmin]);

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
    if(uploading) return toast.info("Veuillez patienter...");
    setLoading(true);
    try {
      // 4. Logique d'envoi conditionnelle
      let apiCall;
      if (isAdmin) {
        apiCall = isEditMode 
          ? axiosClient.put(`/student-enrollments/${id}`, data) 
          : axiosClient.post('/student-enrollments', data);
      } else {
        apiCall = isEditMode 
          ? axiosClient.put(`/director-space/students/${id}`, data) 
          : axiosClient.post('/director-space/students/store', data);
      }
      
      await apiCall;
      toast.success("Enregistré avec succès !");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar>
        <Navbar.Left>
            <div className="flex flex-col">
                <h1 className='font-bold text-xl text-slate-800'>{isEditMode ? "Édition" : "Inscription"}</h1>
                {isDirector && <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1 uppercase tracking-widest"><ShieldCheck size={12}/> Espace Directeur</span>}
            </div>
        </Navbar.Left>
        <Navbar.Right><BackComponent /></Navbar.Right>
      </Navbar>

      <section className="p-4 max-w-6xl mx-auto mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h2 className="text-indigo-600 font-black text-[10px] uppercase mb-8 flex items-center gap-2"><Sparkles size={14}/> Identité</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                   <InputComponent nom="Matricule" name="matricule" register={register} errors={errors} req={true} type="text" placeholder="MATRICULE" icone={<Hash size={16}/>} />
                </div>
                <InputComponent nom="Nom" name="first_name" register={register} errors={errors} req={true} type="text" placeholder="Nom" icone={<User size={16}/>} />
                <InputComponent nom="Prénom" name="last_name" register={register} errors={errors} req={true} type="text" placeholder="Prénom" icone={<User size={16}/>} />
                <InputComponent nom="Né le" name="birth_date" register={register} errors={errors} req={true} type="date" icone={<Calendar size={16}/>} />
                <InputComponent nom="À" name="birth_place" register={register} errors={errors} req={true} type="text" placeholder="Lieu" icone={<MapPin size={16}/>} />
              </div>
              <div className="mt-8">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Genre</label>
                <input type="hidden" {...register("gender", { required: "Requis" })} />
                <div className="flex gap-4">
                  {['M', 'F'].map(g => (
                    <button key={g} type="button" onClick={() => setValue("gender", g, { shouldValidate: true })}
                      className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${selectedGender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                      {g === 'M' ? 'GARÇON' : 'FILLE'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-6">
            {/* PHOTO */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="relative w-40 h-40">
                <div className="w-full h-full rounded-[2.5rem] border-4 border-slate-50 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={40} className="text-slate-300" />}
                </div>
                <label className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </label>
              </div>
              <input type="hidden" {...register("photo")} />
            </div>

            {/* SCOLARITE */}
            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
              <h2 className="text-indigo-400 font-bold text-xs uppercase mb-6 flex items-center gap-2"><GraduationCap size={16}/> Scolarité</h2>
              <div className="space-y-4">
                {/* 5. Affichage conditionnel de l'école */}
                {isAdmin && (
                    <select {...register("school_id", { required: "Requis" })} className="w-full p-4 rounded-2xl bg-slate-800 border-none text-white outline-none">
                        <option value="">Établissement...</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                )}
                
                <select {...register("classroom_id", { required: "Requis" })} className="w-full p-4 rounded-2xl bg-slate-800 border-none text-white outline-none">
                  <option value="">Classe...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <div className="input-dark">
                  <InputComponent nom="Contact Parent" name="contact" register={register} errors={errors} type="tel" placeholder="6xx xxx xxx" icone={<Phone size={16}/>} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || uploading} className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-[11px] tracking-[2px] shadow-xl hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-3 uppercase">
              {loading ? <Loader2 className="animate-spin" /> : (isEditMode ? "Mettre à jour" : "Valider l'inscription")}
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

export default EnrollmentStudent;