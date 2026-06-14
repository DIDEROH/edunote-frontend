import './App.css'
import AxiosProvider from './providers/AxiosProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoutes'
import GuestRoute from './components/GuestRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Layout from './components/elements/Layout'
import NotFound from './pages/Others/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardHome from './components/elements/DashboardHome'
import Others from './pages/Others'

function App() {

  return (
    <BrowserRouter>
      <AxiosProvider>
          <ToastContainer position="bottom-center" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              {/* On affiche un composant d'accueil unique */}
              <Route index element={<DashboardHome />} />
              <Route path="home" element={<DashboardHome />} />


              <Route path="others" element={<Others />} />
            </Route>


            <Route path="*" element={<NotFound />} />
          </Routes>
      </AxiosProvider>
    </BrowserRouter>
  )
}

export default App
