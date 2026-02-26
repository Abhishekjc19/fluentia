import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { Interview as InterviewType } from '../types';

export default function Results() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [interviewId]);

  const loadResults = async () => {
    try {
      const response = await apiClient.getInterview(interviewId!);
      setInterview(response.interview);
    } catch (error) {
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  const scoreColor =
    interview.score! >= 8
      ? 'text-green-600'
      : interview.score! >= 6
        ? 'text-yellow-600'
        : 'text-red-600';

  const scoreLabel =
    interview.score! >= 8 ? 'Excellent!' : interview.score! >= 6 ? 'Good!' : 'Needs Improvement';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center space-x-2 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
          <p className="text-gray-600">Here's your performance summary</p>
        </div>

        {/* Score Card */}
        <div className="card mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Overall Score</h2>
          <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
            {interview.score?.toFixed(1)}
            <span className="text-3xl text-gray-400">/10</span>
          </div>
          <p className={`text-xl font-semibold ${scoreColor}`}>{scoreLabel}</p>
        </div>

        {/* Interview Details */}
        <div className="card mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Interview Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Interview Type</p>
              <p className="font-semibold text-gray-900 capitalize">{interview.interview_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold text-gray-900">
                {interview.completed_at &&
                  interview.started_at &&
                  `${Math.round((new Date(interview.completed_at).getTime() - new Date(interview.started_at).getTime()) / 60000)} minutes`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Started At</p>
              <p className="font-semibold text-gray-900">
                {new Date(interview.started_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed At</p>
              <p className="font-semibold text-gray-900">
                {interview.completed_at && new Date(interview.completed_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="card mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Feedback</h2>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{interview.feedback}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/history')} className="btn-secondary flex-1">
            View History
          </button>
          <button onClick={() => navigate('/interview/setup')} className="btn-primary flex-1">
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}
