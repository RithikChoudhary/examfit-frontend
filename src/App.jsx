import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBoards from './pages/admin/Boards';
import AdminExams from './pages/admin/Exams';
import AdminSubjects from './pages/admin/Subjects';
import AdminQuestionPapers from './pages/admin/QuestionPapers';
import AdminQuestions from './pages/admin/Questions';
import StudentHome from './pages/student/Home';
import StudentExams from './pages/student/Exams';
import StudentSubjects from './pages/student/Subjects';
import QuestionPapers from './pages/student/QuestionPapers';
import TakeTest from './pages/student/TakeTest';
import StudentResults from './pages/student/Results';
import Header from './components/Header';
import Footer from './components/Footer';

// Static Pages
import CurrentAffairs from './pages/static/CurrentAffairs';
import Blog from './pages/static/Blog';
import About from './pages/static/About';
import Contact from './pages/static/Contact';
import StudyMaterial from './pages/static/StudyMaterial';
import Syllabus from './pages/static/Syllabus';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/boards"
            element={
              <ProtectedRoute requireAdmin>
                <AdminBoards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute requireAdmin>
                <AdminExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSubjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/question-papers"
            element={
              <ProtectedRoute requireAdmin>
                <AdminQuestionPapers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute requireAdmin>
                <AdminQuestions />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/"
            element={<StudentHome />}
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <StudentExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <StudentSubjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-papers"
            element={
              <ProtectedRoute>
                <QuestionPapers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:testId"
            element={
              <ProtectedRoute>
                <TakeTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:testId"
            element={
              <ProtectedRoute>
                <StudentResults />
              </ProtectedRoute>
            }
          />

          {/* Static Pages */}
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/study-material" element={<StudyMaterial />} />
          <Route path="/syllabus" element={<Syllabus />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

