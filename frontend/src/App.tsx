import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import Interview from './pages/Interview';
import Results from './pages/Results';
import History from './pages/History';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/interview/setup" element={isAuthenticated ? <InterviewSetup /> : <Navigate to="/login" />} />
        <Route path="/interview/:interviewId" element={isAuthenticated ? <Interview /> : <Navigate to="/login" />} />
        <Route path="/results/:interviewId" element={isAuthenticated ? <Results /> : <Navigate to="/login" />} />
        <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
