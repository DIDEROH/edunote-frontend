import './App.css'
import Layout from './components/Layout';
import AxiosProvider from './providers/AxiosProvider';
import Home from './pages/Home';
import Services from './pages/Services';
import Lab from './pages/Lab';
import Formations from './pages/Formations';
import Realisations from './pages/Realisations';
import Apropos from './pages/Apropos';
import Contact from './pages/Contact';
import Settings from './pages/Settings';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CardTest from './pages/CardTest';


function App() {

  return (
      <BrowserRouter>
        <AxiosProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="lab" element={<Lab />} />
              <Route path="formations" element={<Formations />} />
              <Route path="realisations" element={<Realisations />} />
              <Route path="apropos" element={<Apropos />} />
              <Route path="contact" element={<Contact />} />
              <Route path="settings" element={<Settings />} />
              <Route path="card" element={<CardTest />} />
            </Route>
          </Routes>
        </AxiosProvider>
      </BrowserRouter>
  )
}

export default App