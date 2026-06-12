import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserPlus, Mail, Phone, ShieldCheck, ArrowLeft, 
  Save, Loader2, Eye, EyeOff, RefreshCw, Edit3, Sparkles,
  MapPin, Calendar, Map, User
} from 'lucide-react';
import axiosClient from '../../utils/AxiosClient';
import { toast } from 'react-toastify';
import InputComponent from '../../components/InputComponent';

const PersonnelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditMode) {
      setFetching(true);
      axiosClient.get(`/personnels/${id}`)
        .then(({ data }) => {
          const p = data.data;
          // Remplissage automatique des champs
          const fields = [
            "first_name", "last_name", "email", "phone", 
            "gender", "address", "birth_date", "birth_place"
          ];
          fields.forEach(field => setValue(field, p[field]));

          if (p.roles) {
            const roleIds = p.roles.map(r => r.id.toString());
            setValue("role_ids", roleIds);
          }
        })
        .catch(() => toast.error("Erreur lors de la récupération du profil"))
        .finally(() => setFetching(false));
    }
  }, [id, isEditMode, setValue]);

  const generatePassword = () => {
    const charset = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let retVal = "";
    for (let i = 0; i < 10; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setValue("password", retVal);
    setShowPassword(true);
    toast.info("Mot de passe généré !");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const request = isEditMode 
      ? axiosClient.put(`/personnels/${id}`, data) 
      : axiosClient.post('/personnels', data);

    try {
      await request;
      toast.success(isEditMode ? "Profil mis à jour !" : "Personnel créé !");
      if (!isEditMode) reset();
      navigate(-1);
    } catch (err) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-2 md:p-4 lg:p-6 xl:p-8 text-slate-800">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEditMode ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {isEditMode ? <Edit3 size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Modifier" : "Nouveau Personnel"}</h1>
              <p className="text-sm text-slate-500">Informations administratives et accès.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-2 md:p-4 lg:p-6 xl:p-8">
        <div className="xl:col-span-3 space-y-6">
          
          {/* Section 1: Identité */}
          <div className="bg-white p-2 md:p-4 lg:p-6 xl:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-semibold uppercase tracking-wider text-xs">Informations Identitaires</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputComponent 
                nom="Nom" name="first_name" type="text" req={true} placeholder="Ayile"
                register={register} errors={errors} icone={<User className="w-4 h-4" />}
              />
              <InputComponent 
                nom="Prénom" name="last_name" type="text" req={true} placeholder="Dideroh"
                register={register} errors={errors} icone={<User className="w-4 h-4" />}
              />
              <InputComponent 
                nom="Email Professionnel" name="email" type="email" req={false} placeholder="dideroh@ecole.com"
                register={register} errors={errors} icone={<Mail className="w-4 h-4" />}
              />
              <InputComponent 
                nom="Téléphone" name="phone" type="tel" req={true} placeholder="+237..."
                register={register} errors={errors} icone={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="mt-6">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 block mb-3">Genre</label>
                <div className="flex gap-4">
                    {['M', 'F'].map((g) => (
                        <label key={g} className="flex-1 cursor-pointer">
                            <input type="radio" {...register("gender", { required: true })} value={g} className="peer hidden" />
                            <div className="text-center py-3.5 rounded-2xl bg-slate-50 border-2 border-transparent peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 transition-all font-bold text-sm">
                                {g === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                        </label>
                    ))}
                </div>
                {errors.gender && <p className="text-[10px] text-red-500 mt-1 ml-1">Veuillez choisir un genre</p>}
            </div>
          </div>

          {/* Section 2: Détails & Adresse */}
          <div className="bg-white p-2 md:p-4 lg:p-6 xl:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
              <MapPin className="w-5 h-5" />
              <h2 className="font-semibold uppercase tracking-wider text-xs">Localisation & Naissance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputComponent 
                  nom="Adresse de résidence" name="address" type="text" req={false} placeholder="Ville, Quartier..."
                  register={register} errors={errors} icone={<MapPin className="w-4 h-4" />}
                />
              </div>
              <InputComponent 
                nom="Date de naissance" name="birth_date" type="date" req={false}
                register={register} errors={errors} icone={<Calendar className="w-4 h-4" />}
              />
              <InputComponent 
                nom="Lieu de naissance" name="birth_place" type="text" req={false} placeholder="Hôpital ou Ville"
                register={register} errors={errors} icone={<Map className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Section 3: Sécurité */}
          <div className="bg-white p-2 md:p-4 lg:p-6 xl:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                {isEditMode ? "Changer le mot de passe (optionnel)" : "Sécurité du compte"}
              </label>
              <button type="button" onClick={generatePassword} className="text-[10px] flex items-center gap-1.5 text-indigo-600 font-black hover:bg-indigo-100 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg uppercase">
                <RefreshCw className="w-3 h-3" /> Générer
              </button>
            </div>
            
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"}
                {...register("password", { required: !isEditMode, minLength: { value: 6, message: "6 caractères minimum" } })}
                className={`w-full px-4 py-4 rounded-2xl bg-slate-900 text-indigo-100 border-2 border-transparent focus:border-indigo-500 transition-all font-mono tracking-widest placeholder:text-slate-700 ${errors.password ? 'border-red-500' : ''}`}
                placeholder={isEditMode ? "••••••••" : "Entrez un mot de passe"}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold">{errors.password.message}</p>}
          </div>
        </div>

        {/* Colonne de droite: Rôles */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-semibold uppercase tracking-wider text-xs">Droits d'accès</h2>
            </div>
            <div className="space-y-2">
              {[
                {id: '1', name: 'ADMIN'}, {id: '3', name: 'DIRECTOR'}, 
                {id: '2', name: 'TEACHER'}, {id: '4', name: 'MODERATOR'}
              ].map((role) => (
                <label key={role.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-indigo-50/50 border border-transparent cursor-pointer transition-all">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">{role.name}</span>
                  <input type="checkbox" value={role.id} {...register("role_ids")} className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-5 rounded-3xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-70 text-white ${isEditMode ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={20} />}
            {isEditMode ? "ENREGISTRER" : "CRÉER LE COLLABORATEUR"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonnelForm;