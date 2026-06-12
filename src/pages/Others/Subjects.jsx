import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Edit3, Trash2, Hash, Layers } from "lucide-react";
import axiosClient from "../../utils/AxiosClient";
import { toast } from "react-toastify";
import AddBtn from "../../components/AddBtn";
import BtnList from "../../components/BtnList";
import Loading from "../../components/Loading";
import Navbar from "../../components/Navbar";
import LoadingSkeletoon from "../../components/LoadingSkeletoon";
import useShowConfirm from "../../hooks/UseShowConfirm";

function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const showConfirm = useShowConfirm()

  // Charger les matières
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/subjects");
      setSubjects(data.data || []);
    } catch (error) {
      toast.error("Impossible de charger les matières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Supprimer une matière
  const handleDelete = async (id) => {
    showConfirm({
      title: "Supprimer une matière",
      message: "Voulez-vous vraiment supprimer cette matière ?",
      onSuccess: () => {
        axiosClient.delete(`/subjects/${id}`)
        .then(() => {
          toast.success("Matière supprimée");
          fetchSubjects();
        })
        .catch((error) => toast.error("Erreur lors de la suppression"))
      }
    })
  };

  return (
    <main className="min-h-screen bg-slate-50/50">
      <Navbar>
        <Navbar.Left>
          <AddBtn action={() => navigate("/edunote/subjects/create")} />
        </Navbar.Left>

        <Navbar.Center>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <BookOpen size={16} className="text-indigo-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                    Gestion des Matières ({subjects.length})
                </span>
            </div>
        </Navbar.Center>

        <Navbar.Right>
          <Loading load={loading} />
          <BtnList action={fetchSubjects} />
        </Navbar.Right>
      </Navbar>

      {
        loading ? <LoadingSkeletoon /> :
        <section className="max-w-6xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
          <div className="bg-white rounded-md shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50">

                  <th className="p-2 md:p-4 lg:p-6 xl:p-8 text-left text-[10px] font-black uppercase tracking-[2px] text-slate-400">Code</th>

                  <th className="p-2 md:p-4 lg:p-6 xl:p-8 text-left text-[10px] font-black uppercase tracking-[2px] text-slate-400">Intitulé de la matière</th>

                  <th className="p-2 md:p-4 lg:p-6 xl:p-8 text-center text-[10px] font-black uppercase tracking-[2px] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="group hover:bg-slate-50/50 transition-colors">
                  
                    <td className="p-2">
                      <div className="flex gap-3">
                        <span className="font-bold text-slate-700 uppercase tracking-tighter">
                          {subject?.code}
                        </span>
                      </div>
                    </td>

                    <td className="p-2">
                      <span className="text-sm font-bold text-slate-600">
                          {subject?.name}
                      </span>
                    </td>

                    <td className="p-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/edunote/subjects/create/${subject.id}`)}
                          className="p-2 text-slate-400 cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Modifier"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="p-2 text-slate-400 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
                
                {subjects.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-slate-50 text-slate-200 rounded-full">
                              <BookOpen size={48} />
                          </div>
                          <p className="text-slate-400 font-bold text-sm">Aucune matière enregistrée pour le moment</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      }

    </main>
  );
}

export default Subjects;