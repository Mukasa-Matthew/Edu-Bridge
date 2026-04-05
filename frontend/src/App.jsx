import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext.jsx'
import HomePage from './pages/HomePage.jsx'
import BrowseTutorsPage from './pages/BrowseTutorsPage.jsx'
import ProgramsPage from './pages/ProgramsPage.jsx'
import Login from './pages/Login.jsx'
import StudentRegister from './pages/StudentRegister.jsx'
import TutorRegister from './pages/TutorRegister.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import TutorDashboard from './pages/TutorDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

/** App routes — marketing site + auth placeholders + dashboards */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tutors" element={<BrowseTutorsPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/tutor" element={<TutorRegister />} />
          <Route path="/dashboard/student/*" element={<StudentDashboard />} />
          <Route path="/dashboard/tutor/*" element={<TutorDashboard />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
