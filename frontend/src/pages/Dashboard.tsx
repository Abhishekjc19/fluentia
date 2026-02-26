import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Play, History, BarChart3, Briefcase, Code } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import { UserStats } from '../types';

export default function Dashboard() {
  const { user, clearAuth } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiClient.getUserStats();
      setStats(response.stats);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      clearAuth();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Fluentia</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {user?.full_name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Practice and improve your interview skills with AI</p>
        </div>

        {/* Stats Cards */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-primary-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedInterviews}</p>
                </div>
                <Play className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/interview/setup" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <Code className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Technical Interview</h3>
                <p className="text-gray-600">
                  Practice coding questions, data structures, algorithms, and system design
                </p>
                <div className="mt-4 flex items-center text-primary-600 font-medium">
                  Start Interview
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/interview/setup" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">HR Interview</h3>
                <p className="text-gray-600">
                  Practice behavioral questions, soft skills, and professional scenarios
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium">
                  Start Interview
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/history" className="card hover:shadow-lg transition-shadow cursor-pointer group md:col-span-2">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <History className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Interview History</h3>
                <p className="text-gray-600">
                  Review your past interviews, scores, and feedback to track your progress
                </p>
                <div className="mt-4 flex items-center text-purple-600 font-medium">
                  View History
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
