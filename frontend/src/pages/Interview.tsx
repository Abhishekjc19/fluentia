import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Mic, MicOff, Video, VideoOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../lib/api';
import { useInterviewStore } from '../store/interviewStore';

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function Interview() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const { questions, currentQuestionIndex, addAnswer, nextQuestion } = useInterviewStore();

  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (!questions || questions.length === 0) {
      toast.error('No interview found');
      navigate('/dashboard');
    } else {
      startRecording();
      initializeSpeechRecognition();
    }

    return () => {
      stopRecording();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      toast.error('Voice input not supported in this browser. Please use Chrome or Edge.');
      setIsVoiceMode(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak your answer');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswer((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'aborted') {
        // Ignore aborted errors (typically when stopping)
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const startRecording = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getRecordedVideo = (): Blob | null => {
    if (recordedChunksRef.current.length > 0) {
      return new Blob(recordedChunksRef.current, { type: 'video/webm' });
    }
    return null;
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.submitAnswer(
        currentQuestion.id,
        answer,
        undefined // Audio can be added later
      );

      addAnswer(response.answer);
      toast.success('Answer submitted!');

      if (isLastQuestion) {
        // Complete the interview
        await handleCompleteInterview();
      } else {
        setAnswer('');
        nextQuestion();
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      stopRecording();
      const videoBlob = getRecordedVideo();

      await apiClient.completeInterview(interviewId!, videoBlob || undefined);
      toast.success('Interview completed!');
      navigate(`/results/${interviewId}`);
    } catch (error) {
      toast.error('Failed to complete interview');
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    if (webcamRef.current && webcamRef.current.stream) {
      webcamRef.current.stream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    if (webcamRef.current && webcamRef.current.stream) {
      webcamRef.current.stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {isRecording && <span className="text-red-500">● Recording</span>}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Camera</h3>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {isCameraOn ? (
                  <Webcam
                    ref={webcamRef}
                    audio={isMicOn}
                    className="w-full h-full object-cover"
                    mirrored
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <VideoOff className="w-12 h-12 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full ${
                    isCameraOn ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full ${
                    isMicOn ? 'bg-primary-100 text-primary-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Question and Answer */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Question</h3>
                <p className="text-xl font-semibold text-gray-900">
                  {currentQuestion.question_text}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsVoiceMode(!isVoiceMode)}
                      className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                        isVoiceMode
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isVoiceMode ? '🎤 Voice' : '⌨️ Type'}
                    </button>
                  </div>
                </div>

                {isVoiceMode ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <div className="text-center">
                      <div className="mb-4">
                        {isListening ? (
                          <div className="animate-pulse">
                            <Mic className="w-16 h-16 text-red-500 mx-auto" />
                            <p className="text-red-600 font-semibold mt-2">Listening...</p>
                          </div>
                        ) : (
                          <>
                            <Mic className="w-16 h-16 text-gray-400 mx-auto" />
                            <p className="text-gray-600 mt-2">Click to start voice recording</p>
                          </>
                        )}
                      </div>

                      <button
                        onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          isListening
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        {isListening ? 'Stop Recording' : 'Start Voice Recording'}
                      </button>

                      {answer && (
                        <div className="mt-6 text-left bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-2">Transcribed text:</p>
                          <p className="text-gray-900">{answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={10}
                    placeholder="Type your answer here... Be as detailed as possible."
                  />
                )}

                <p className="mt-2 text-sm text-gray-500">
                  {isVoiceMode
                    ? 'Speak clearly and naturally. Your speech will be automatically transcribed.'
                    : 'Take your time to provide a thoughtful answer. The AI will evaluate your response.'}
                </p>
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !answer.trim()}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
              >
                <Send className="w-5 h-5" />
                <span>
                  {loading
                    ? 'Submitting...'
                    : isLastQuestion
                      ? 'Submit & Complete'
                      : 'Submit Answer'}
                </span>
              </button>
            </div>

            {/* Tips */}
            <div className="card mt-6 bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for a great answer:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Be specific and provide examples</li>
                <li>• Structure your answer clearly</li>
                <li>• Show your thought process</li>
                <li>• Be honest and authentic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
