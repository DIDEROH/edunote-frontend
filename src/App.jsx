import { toast } from 'sonner';
import './App.css'
import { useNotify } from './hooks/useNotify';
import AxiosProvider from './providers/AxiosProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react';
import Layout from './components/Layout';


function App() {
  const { deleteToast } = useNotify();
  
  useEffect(() => {
    deleteToast("ce projet", () => {
      toast.success("Action de suppression confirmée !");
    });
  }, []);

  return (
      <BrowserRouter>
        <AxiosProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Les routes pour les différentes pages  */}
            </Route>
          </Routes>
        </AxiosProvider>
      </BrowserRouter>
  )
}

export default App