import './App.css'
import AxiosProvider from './providers/AxiosProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoutes'
import GuestRoute from './components/GuestRoute'

import Layout from './components/elements/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
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

function App() {

  return (
    <BrowserRouter>
      <AxiosProvider>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

              {/* On affiche un composant d'accueil unique */}
              <Route index element={<DashboardHome />} />
              <Route path="home" element={<DashboardHome />} />

              {/* Les routes pour autres */}
              <Route path="others" element={<Others />} />

              {/* Routes  pour la gestion des annees scolaires */}
              <Route path='academic-years' element={<AcademicYear />} />

              {/* Routes des ecoles */}
              <Route path='schools' element={<School />} />
              <Route path='schools/:id' element={<SchoolInformations />} />

              {/* La gestion des utilisateurs */}
              <Route path='users' element={<UsersPage />} />


              {/* Directeur */}
              <Route path='director-list' element={<DirectorsList />} />

              {/* Les enseignants  */}
              <Route path='teacher-list' element={<TeacherList />} />
              <Route path='director/teachers' element={<DirectorTeacherManagement />} />
              <Route path='marks/entry' element={<TeacherMarkEntry />} />
              <Route path='marks/hub' element={<TeacherMarkHub />} />

              {/* les salles de classes  */}
              <Route path='classrooms' element={<Classroom />} />
              <Route path='classrooms/:id' element={<ClassroomDetail />} />

              {/* Matieres et competences */}
              <Route path='pedagogie' element={<Pedagogie />} />
              <Route path='skills' element={<SkillsConfig />} />
              <Route path='assign-skills' element={<SkillsConfig />} />

              {/* Les matieres */}
              <Route path='subjects' element={<Subjects />} /> 

              {/* Les eleves */}
              <Route path='students' element={<StudentPage />} /> 
              <Route path='students/create' element={<EnrollmentStudent />} /> 
              <Route path='students/edit/:id' element={<EnrollmentStudent />} /> 
              <Route path='students/:id' element={<StudentIformations />} />

            </Route>


            <Route path="403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </AxiosProvider>
    </BrowserRouter>
  )
}

export default App
