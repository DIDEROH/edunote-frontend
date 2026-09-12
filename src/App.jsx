import './App.css'
import AxiosProvider from './providers/AxiosProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoutes'
import RoleRoute from './routes/RoleRoute'
import GuestRoute from './components/GuestRoute'

import Layout from './components/elements/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DashboardHome from './components/elements/DashboardHome'
import Others from './pages/Others'
import AcademicYear from './pages/AcademicYear'
import School from './pages/School'
import SchoolInformations from './pages/SchoolInformations'
import UsersPage from './pages/UsersPage'
import DirectorsList from './pages/DirectorsList'
import TeacherList from './pages/TeacherList'
import Classroom from './pages/Classroom'
import Subjects from './pages/Subjects'
import ClassroomDetail from './pages/ClassroomDetail'
import Pedagogie from './pages/Pedagogie'
import SkillsConfig from './pages/SkillsConfig'
import StudentPage from './pages/StudentPage'
import EnrollmentStudent from './pages/EnrollmentStudent'
import StudentIformations from './pages/StudentIformations'
import DirectorTeacherManagement from './pages/DirectorTeacherManagement'
import TeacherMarkEntry from './pages/Teachers/TeacherMarkEntry'
import TeacherMarkHub from './pages/Teachers/TeacherMarkHub'
import Forbidden from './pages/Forbidden'
import Bulletins from './pages/ReportCards/Bulletins'
import Visualiser from './pages/ReportCards/Visualiser'

function App() {

  return (
    <BrowserRouter>
      <AxiosProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

              {/* On affiche un composant d'accueil unique */}
              <Route index element={<DashboardHome />} />
              <Route path="home" element={<DashboardHome />} />

              {/* Les routes pour autres (admin) */}
              <Route path="others" element={<RoleRoute allow={['admin']}><Others /></RoleRoute>} />

              {/* Routes  pour la gestion des annees scolaires (admin) */}
              <Route path='academic-years' element={<RoleRoute allow={['admin']}><AcademicYear /></RoleRoute>} />

              {/* Routes des ecoles (admin) */}
              <Route path='schools' element={<RoleRoute allow={['admin']}><School /></RoleRoute>} />
              <Route path='schools/:id' element={<RoleRoute allow={['admin']}><SchoolInformations /></RoleRoute>} />

              {/* La gestion des utilisateurs (admin) */}
              <Route path='users' element={<RoleRoute allow={['admin']}><UsersPage /></RoleRoute>} />


              {/* Directeur (admin) */}
              <Route path='director-list' element={<RoleRoute allow={['admin']}><DirectorsList /></RoleRoute>} />

              {/* Les enseignants  */}
              <Route path='teacher-list' element={<RoleRoute allow={['admin']}><TeacherList /></RoleRoute>} />
              <Route path='director/teachers' element={<RoleRoute allow={['director']}><DirectorTeacherManagement /></RoleRoute>} />
              <Route path='marks/entry' element={<RoleRoute allow={['teacher']}><TeacherMarkEntry /></RoleRoute>} />
              <Route path='marks/hub' element={<RoleRoute allow={['teacher']}><TeacherMarkHub /></RoleRoute>} />

              {/* les salles de classes (admin) */}
              <Route path='classrooms' element={<RoleRoute allow={['admin']}><Classroom /></RoleRoute>} />
              <Route path='classrooms/:id' element={<RoleRoute allow={['admin']}><ClassroomDetail /></RoleRoute>} />

              {/* Matieres et competences (admin) */}
              <Route path='pedagogie' element={<RoleRoute allow={['admin']}><Pedagogie /></RoleRoute>} />
              <Route path='skills' element={<RoleRoute allow={['admin']}><SkillsConfig /></RoleRoute>} />

              {/* Les matieres (admin) */}
              <Route path='subjects' element={<RoleRoute allow={['admin']}><Subjects /></RoleRoute>} />

              {/* Les eleves (admin, directeur, moderateur) */}
              <Route path='students' element={<RoleRoute allow={['admin', 'director', 'moderator']}><StudentPage /></RoleRoute>} />
              <Route path='students/create' element={<RoleRoute allow={['admin', 'director', 'moderator']}><EnrollmentStudent /></RoleRoute>} />
              <Route path='students/edit/:id' element={<RoleRoute allow={['admin', 'director', 'moderator']}><EnrollmentStudent /></RoleRoute>} />
              <Route path='students/:id' element={<RoleRoute allow={['admin', 'director', 'moderator']}><StudentIformations /></RoleRoute>} />


              {/* Les bulletins (admin, directeur, moderateur) */}
              <Route path='report-card' element={<RoleRoute allow={['admin', 'director', 'moderator']}><Bulletins /></RoleRoute>} />
              <Route path='report-card/visualiser' element={<RoleRoute allow={['admin', 'director', 'moderator']}><Visualiser /></RoleRoute>} />

            </Route>


            <Route path="403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </AxiosProvider>
    </BrowserRouter>
  )
}

export default App
