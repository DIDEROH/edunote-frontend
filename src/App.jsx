import './App.css'
import AxiosProvider from './providers/AxiosProvider'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './routes/PrivateRoutes'
import GuestRoute from './components/GuestRoute'
import { useHasRole } from './hooks/UseHasRole'
import { ConfirmProvider } from './providers/ConfirmProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import NotFound from './pages/Others/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'

import Dashboard from './pages/Admin/Dashboard'
import Effectifs from './pages/Admin/Effectifs'
import Personnel from './pages/Admin/Personnel'
import SkillsConfig from './pages/Admin/SkillsConfig'
import SuccessRates from './pages/Admin/SuccessRates'
import TermLockConfig from './pages/Admin/TermLockConfig'

import DirectorAssignment from './pages/Directors/DirectorAssignment'
import DirectorClassroomReports from './pages/Directors/DirectorClassroomReports'
import DirectorDashboard from './pages/Directors/DirectorDashboard'
import DirectorEnrollmentStudent from './pages/Directors/DirectorEnrollmentStudent'
import DirectorFromActiveYear from './pages/Directors/DirectorFromActiveYear'
import DirectorPerformance from './pages/Directors/DirectorPerformance'
import DirectorStudentList from './pages/Directors/DirectorStudentList'
import DirectorTeacherManagement from './pages/Directors/DirectorTeacherManagement'
import DirectorsList from './pages/Directors/DirectorsList'

import AcademicYear from './pages/Others/AcademicYear'
import AssignSubjects from './pages/Others/AssignSubjects'
import Classroom from './pages/Others/Classroom'
import CreatePersonnel from './pages/Others/CreatePersonnel'
import School from './pages/Others/School'
import SchoolConfigure from './pages/Others/SchoolConfigure'
import Subjects from './pages/Others/Subjects'
import CRSubjects from './pages/Others/CRSubjects'

import EnrollmentStudent from './pages/Students/EnrollmentStudent'
import Student from './pages/Students/Student'
import StudentIformations from './pages/Students/StudentIformations'

import Bulletins from './pages/ReportCards/Bulletins'
import ClassroomReportCards from './pages/ReportCards/ClassroomReportCards'
import StudentReportCard from './pages/ReportCards/StudentReportCard'
import SchoolReportCards from './pages/ReportCards/SchoolReportCards'

import TeachersList from './pages/Teachers/TeachersList'
import TeacherAssignment from './pages/Teachers/TeacherAssignment'
import TeacherSchedule from './pages/Teachers/TeacherSchedule'
import SkillMarkEntry from './pages/Teachers/SkillMarkEntry'
import SkillMarkHub from './pages/Teachers/SkillMarkHub'

function App() {
  const isAdmin = useHasRole('Admin')
  const isTeacher = useHasRole('Teacher')
  const isDirector = useHasRole('Director')

  return (
    <BrowserRouter>
      <AxiosProvider>
        <ConfirmProvider>
          <ToastContainer position="bottom-center" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/" element={<Navigate to="/edunote" replace />} />

            <Route path="/edunote" element={<PrivateRoute><Layout /></PrivateRoute>}>
              {isAdmin && <Route index element={<SuccessRates />} />}
              {isTeacher && <Route index element={<SkillMarkHub />} />}
              {isDirector && <Route index element={<DirectorStudentList />} />}

              <Route path="students" element={<Student />} />
              <Route path="add-student" element={<EnrollmentStudent />} />
              <Route path="add-student/:id" element={<EnrollmentStudent />} />
              <Route path="bulletins/:id" element={<StudentReportCard />} />
              <Route path="bulletins" element={<Bulletins />} />
              <Route path="stats" element={<SuccessRates />} />
              <Route path="effectifs" element={<Effectifs />} />
              <Route path="student-informations/:id" element={<StudentIformations />} />
              <Route path="school" element={<School />} />
              <Route path="school/:id" element={<SchoolConfigure />} />
              <Route path="academic-years" element={<AcademicYear />} />
              <Route path="classrooms" element={<Classroom />} />
              <Route path="personnel" element={<Personnel />} />
              <Route path="create-personnel" element={<CreatePersonnel />} />
              <Route path="create-personnel/:id" element={<CreatePersonnel />} />
              <Route path="classroom/assign/:id" element={<AssignSubjects />} />
              <Route path="skills" element={<SkillsConfig />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="subjects/create" element={<CRSubjects />} />
              <Route path="subjects/create/:id" element={<CRSubjects />} />
              <Route path="teachers/list" element={<TeachersList />} />
              <Route path="teachers/assign" element={<TeacherAssignment />} />
              <Route path="teachers/assign/list/:teacherId" element={<TeacherSchedule />} />
              <Route path="bulletins/ecole/:schoolId/classe/:id" element={<ClassroomReportCards />} />
              <Route path="bulletins/classe/:id" element={<DirectorClassroomReports />} />
              <Route path="validation" element={<TermLockConfig />} />
              <Route path="marks/entry" element={<SkillMarkEntry />} />
              <Route path="marks/hub" element={<SkillMarkHub />} />
              <Route path="director/performances" element={<DirectorPerformance />} />
              <Route path="directors/list" element={<DirectorsList />} />
              <Route path="directors/list/active" element={<DirectorFromActiveYear />} />
              <Route path="directors/assign" element={<DirectorAssignment />} />
              <Route path="directors/teachers" element={<DirectorTeacherManagement />} />
              <Route path="directors/students/list" element={<DirectorStudentList />} />
              <Route path="directors/add-student" element={<DirectorEnrollmentStudent />} />
              <Route path="director/stats" element={<DirectorDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ConfirmProvider>
      </AxiosProvider>
    </BrowserRouter>
  )
}

export default App
