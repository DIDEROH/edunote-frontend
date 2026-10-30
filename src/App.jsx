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
import Invitation from './pages/Invitation'
import DashboardHome from './components/elements/DashboardHome'
import Schools from './pages/admin/Schools'
import SchoolInformations from './pages/SchoolInformations'
import Classroom from './pages/Classroom'
import Subjects from './pages/Subjects'
import SchoolClassroomSubjects from './pages/SchoolClassroomSubjects'
import MySchoolClasses from './pages/MySchoolClasses'
import SkillsConfig from './pages/SkillsConfig'
import Staff from './pages/school/Staff'
import Calendar from './pages/school/Calendar'
import MySchool from './pages/school/MySchool'
import StudentPage from './pages/StudentPage'
import EnrollmentStudent from './pages/EnrollmentStudent'
import StudentIformations from './pages/StudentIformations'
import DirectorTeacherManagement from './pages/DirectorTeacherManagement'
import TeacherMarkEntry from './pages/Teachers/TeacherMarkEntry'
import TeacherMarkHub from './pages/Teachers/TeacherMarkHub'
import Forbidden from './pages/Forbidden'
import Bulletins from './pages/ReportCards/Bulletins'
import Visualiser from './pages/ReportCards/Visualiser'
import Profile from './pages/Profile'

// Gestion de l'école : chef d'établissement et modérateurs (droits accordés par le directeur)
const SCHOOL = ['director', 'moderator']

function App() {

  return (
    <BrowserRouter>
      <AxiosProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            {/* Inscription d'un chef d'établissement avec son école */}
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            {/* Lien d'invitation reçu par WhatsApp (connecté ou non) */}
            <Route path="/invitation/:token" element={<Invitation />} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

              {/* On affiche un composant d'accueil unique */}
              <Route index element={<DashboardHome />} />
              <Route path="home" element={<DashboardHome />} />

              {/* Profil de l'utilisateur connecté (tous les rôles) */}
              <Route path="profile" element={<Profile />} />

              {/* EduNote : validation des établissements et catalogues communs */}
              <Route path='schools' element={<RoleRoute allow={['admin']}><Schools /></RoleRoute>} />
              <Route path='schools/:id' element={<RoleRoute allow={['admin']}><SchoolInformations /></RoleRoute>} />
              <Route path='classrooms' element={<RoleRoute allow={['admin']}><Classroom /></RoleRoute>} />
              <Route path='subjects' element={<RoleRoute allow={['admin']}><Subjects /></RoleRoute>} />

              {/* École : classes, matières et coefficients, compétences */}
              <Route path='my-classes' element={<RoleRoute allow={SCHOOL}><MySchoolClasses /></RoleRoute>} />
              <Route path='my-classes/:classroomId' element={<RoleRoute allow={SCHOOL} permission="classes"><SchoolClassroomSubjects /></RoleRoute>} />
              <Route path='skills' element={<RoleRoute allow={SCHOOL} permission="classes"><SkillsConfig /></RoleRoute>} />

              {/* École : personnel, affectations, calendrier, paramètres */}
              <Route path='staff' element={<RoleRoute allow={SCHOOL}><Staff /></RoleRoute>} />
              <Route path='director/teachers' element={<RoleRoute allow={SCHOOL}><DirectorTeacherManagement /></RoleRoute>} />
              <Route path='calendar' element={<RoleRoute allow={SCHOOL} permission="calendar"><Calendar /></RoleRoute>} />
              <Route path='my-school' element={<RoleRoute allow={['director']} directorOnly><MySchool /></RoleRoute>} />

              {/* École : élèves (consultation ; inscription avec le droit « élèves ») */}
              <Route path='students' element={<RoleRoute allow={SCHOOL}><StudentPage /></RoleRoute>} />
              <Route path='students/create' element={<RoleRoute allow={SCHOOL} permission="students"><EnrollmentStudent /></RoleRoute>} />
              <Route path='students/edit/:id' element={<RoleRoute allow={SCHOOL} permission="students"><EnrollmentStudent /></RoleRoute>} />
              <Route path='students/:id' element={<RoleRoute allow={SCHOOL}><StudentIformations /></RoleRoute>} />

              {/* École : bulletins */}
              <Route path='report-card' element={<RoleRoute allow={SCHOOL} permission="bulletins"><Bulletins /></RoleRoute>} />
              <Route path='report-card/visualiser' element={<RoleRoute allow={SCHOOL} permission="bulletins"><Visualiser /></RoleRoute>} />

              {/* Enseignants */}
              <Route path='marks/entry' element={<RoleRoute allow={['teacher']}><TeacherMarkEntry /></RoleRoute>} />
              <Route path='marks/hub' element={<RoleRoute allow={['teacher']}><TeacherMarkHub /></RoleRoute>} />

            </Route>


            <Route path="403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </AxiosProvider>
    </BrowserRouter>
  )
}

export default App
