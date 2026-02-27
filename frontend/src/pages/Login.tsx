import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Logging in...');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingMessage('Logging in...');

    try {
      console.log('🔐 Attempting login...', { email });

      // Show warm-up message after 3 seconds
      const warmupTimer = setTimeout(() => {
        setLoadingMessage('Waking up server... This may take 30 seconds on first request');
      }, 3000);

      const response = await apiClient.login(email, password);
      clearTimeout(warmupTimer);

      console.log('✅ Login successful', response);
      setAuth(response.user, response.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your connection and try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMessage('Logging in...');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03e3fc] rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Fluentia</h1>
          <p className="text-gray-600">AI-Powered Mock Interview Platform</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? loadingMessage : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#03e3fc] hover:text-[#02c4d9] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
