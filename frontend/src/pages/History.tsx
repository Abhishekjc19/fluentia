import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { Interview } from '../types';

export default function History() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await apiClient.getInterviews();
      setInterviews(response.interviews);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center space-x-2 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview History</h1>
          <p className="text-gray-600">Review your past interviews and track your progress</p>
        </div>

        {interviews.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No interviews yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first mock interview to see your history
            </p>
            <button onClick={() => navigate('/interview/setup')} className="btn-primary">
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  interview.status === 'completed' && navigate(`/results/${interview.id}`)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          interview.interview_type === 'tech'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {interview.interview_type} Interview
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          interview.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(interview.started_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(interview.started_at).toLocaleTimeString()}</span>
                      </div>
                      {interview.completed_at && interview.started_at && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {Math.round(
                              (new Date(interview.completed_at).getTime() -
                                new Date(interview.started_at).getTime()) /
                                60000
                            )}{' '}
                            min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {interview.status === 'completed' && interview.score !== undefined && (
                    <div
                      className={`flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(interview.score)}`}
                    >
                      <div className="text-center">
                        <Award
                          className={`w-6 h-6 mx-auto mb-1 ${getScoreColor(interview.score)}`}
                        />
                        <div className={`text-2xl font-bold ${getScoreColor(interview.score)}`}>
                          {interview.score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {interview.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {interview.feedback?.substring(0, 150)}...
                    </p>
                    <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
