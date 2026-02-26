import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Briefcase, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { useInterviewStore } from '../store/interviewStore';

export default function InterviewSetup() {
  const [selectedType, setSelectedType] = useState<'tech' | 'hr' | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setInterview = useInterviewStore((state) => state.setInterview);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOCX, or TXT file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      toast.success('Resume uploaded! Questions will be personalized based on your resume.');
    }
  };

  const handleStart = async () => {
    if (!selectedType) {
      toast.error('Please select an interview type');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.startInterview(selectedType, resumeFile);
      setInterview(response.interview, response.questions);
      const message = response.resumeBasedQuestions
        ? 'Interview started with personalized questions based on your resume!'
        : 'Interview started! Camera will now activate.';
      toast.success(message);
      navigate(`/interview/${response.interview.id}`);
    } catch (error) {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary flex items-center space-x-2 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Interview</h1>
          <p className="text-gray-600 mb-8">Select the type of interview you want to practice</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Technical Interview */}
            <button
              onClick={() => setSelectedType('tech')}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                selectedType === 'tech'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    selectedType === 'tech' ? 'bg-primary-200' : 'bg-primary-100'
                  }`}
                >
                  <Code className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Technical</h3>
                  <p className="text-sm text-gray-600">
                    Programming concepts, algorithms, data structures, and problem-solving
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    <li>• 5 questions</li>
                    <li>• ~20-30 minutes</li>
                    <li>• Real-time AI evaluation</li>
                  </ul>
                </div>
              </div>
            </button>

            {/* HR Interview */}
            <button
              onClick={() => setSelectedType('hr')}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                selectedType === 'hr'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-3 rounded-lg ${
                    selectedType === 'hr' ? 'bg-green-200' : 'bg-green-100'
                  }`}
                >
                  <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">HR</h3>
                  <p className="text-sm text-gray-600">
                    Behavioral questions, soft skills, and professional scenarios
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    <li>• 5 questions</li>
                    <li>• ~15-25 minutes</li>
                    <li>• Real-time AI evaluation</li>
                  </ul>
                </div>
              </div>
            </button>
          </div>

          {/* Resume Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Your Resume (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Upload your resume to get personalized interview questions based on your experience
              and skills.
            </p>
            <div className="flex items-center space-x-4">
              <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {resumeFile ? resumeFile.name : 'Choose file (PDF, DOCX, TXT)'}
                </span>
              </label>
              {resumeFile && (
                <button
                  onClick={() => setResumeFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">Before you start:</h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>✓ Ensure your camera and microphone are working</li>
              <li>✓ Find a quiet space with good lighting</li>
              <li>✓ Camera will record throughout the interview</li>
              <li>✓ Each question will be evaluated by AI</li>
              <li>✓ You'll receive detailed feedback at the end</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedType || loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'Starting Interview...' : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
