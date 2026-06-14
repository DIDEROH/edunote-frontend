import './App.css'
import AxiosProvider from './providers/AxiosProvider'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoutes'
import GuestRoute from './components/GuestRoute'
import { useHasRole } from './hooks/UseHasRole'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Layout from './components/elements/Layout'
import NotFound from './pages/Others/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const isAdmin = useHasRole('Admin')
  const isTeacher = useHasRole('Teacher')
  const isDirector = useHasRole('Director')

  return (
    <BrowserRouter>
      <AxiosProvider>
          <ToastContainer position="bottom-center" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              {/* {isAdmin && <Route index element={<SuccessRates />} />}
              {isTeacher && <Route index element={<SkillMarkHub />} />}
              {isDirector && <Route index element={<DirectorStudentList />} />} */}

            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
      </AxiosProvider>
    </BrowserRouter>
  )
}

export default App
