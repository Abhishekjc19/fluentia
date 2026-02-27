import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log API URL for debugging
console.log('🔗 API URL:', API_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('🌐 API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
          }
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        } else if (!error.response) {
          // Network error
          toast.error('Network error. Please check your internet connection.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  async signup(email: string, password: string, full_name: string) {
    const { data } = await this.client.post('/auth/signup', { email, password, full_name });
    return data;
  }

  async logout() {
    const { data } = await this.client.post('/auth/logout');
    return data;
  }

  // User endpoints
  async getCurrentUser() {
    const { data } = await this.client.get('/users/me');
    return data;
  }

  async getUserStats() {
    const { data } = await this.client.get('/users/stats');
    return data;
  }

  // Interview endpoints
  async startInterview(interview_type: 'tech' | 'hr', resumeFile?: File | null) {
    if (resumeFile) {
      const formData = new FormData();
      formData.append('interview_type', interview_type);
      formData.append('resume', resumeFile);

      const { data } = await this.client.post('/interviews/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } else {
      const { data } = await this.client.post('/interviews/start', { interview_type });
      return data;
    }
  }

  async getInterview(interviewId: string) {
    const { data } = await this.client.get(`/interviews/${interviewId}`);
    return data;
  }

  async getInterviews() {
    const { data } = await this.client.get('/interviews');
    return data;
  }

  async submitAnswer(questionId: string, answerText: string, audioBlob?: Blob) {
    const formData = new FormData();
    formData.append('question_id', questionId);
    formData.append('answer_text', answerText);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'answer.webm');
    }

    const { data } = await this.client.post('/interviews/answer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }

  async completeInterview(interviewId: string, videoBlob?: Blob) {
    const formData = new FormData();
    if (videoBlob) {
      formData.append('video', videoBlob, 'interview.webm');
    }

    const { data } = await this.client.post(`/interviews/${interviewId}/complete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
}

export const apiClient = new ApiClient();
