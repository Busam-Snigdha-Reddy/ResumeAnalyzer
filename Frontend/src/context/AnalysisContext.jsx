import React, { createContext, useState, useCallback } from 'react';
import api from '../services/api';

export const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({ active: false, progress: 0, text: '' });

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  }, []);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await api.get('/analysis');
      setAnalyses(res.data);
    } catch (err) {
      console.error('Error fetching job analyses:', err);
    }
  }, []);

  // Poll for completion of resume parsing
  const pollResumeStatus = async (resumeId) => {
    setProcessingStatus({ active: true, progress: 30, text: 'Extracting text structure...' });
    
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/resumes/${resumeId}`);
        const resume = res.data;

        if (resume.status === 'completed') {
          clearInterval(interval);
          setCurrentResume(resume);
          setProcessingStatus({ active: false, progress: 100, text: 'Resume analyzed successfully!' });
          await fetchResumes();
        } else if (resume.status === 'failed') {
          clearInterval(interval);
          setProcessingStatus({ active: false, progress: 0, text: `Analysis failed: ${resume.errorMessage || 'Unknown error'}` });
          alert(`Resume processing failed: ${resume.errorMessage}`);
        } else {
          // Increment progress slightly for visual aesthetics
          setProcessingStatus(prev => ({
            ...prev,
            progress: Math.min(prev.progress + 15, 90),
            text: 'Parsing elements and evaluating layouts with AI...',
          }));
        }
      } catch (error) {
        clearInterval(interval);
        setProcessingStatus({ active: false, progress: 0, text: 'Error polling processing status.' });
        console.error('Error polling resume status:', error);
      }
    }, 1500);
  };

  // Upload Resume File
  const uploadResumeFile = async (file) => {
    setProcessingStatus({ active: true, progress: 10, text: 'Uploading document...' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { resume } = res.data;
      pollResumeStatus(resume._id);
      return { success: true, resumeId: resume._id };
    } catch (error) {
      setProcessingStatus({ active: false, progress: 0, text: '' });
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload resume.',
      };
    }
  };

  // Poll for job comparison completion
  const pollJobAnalysisStatus = async (analysisId) => {
    setProcessingStatus({ active: true, progress: 40, text: 'Mapping skill alignment metrics...' });

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/analysis/${analysisId}`);
        const analysis = res.data;

        if (analysis.status === 'completed') {
          clearInterval(interval);
          setCurrentAnalysis(analysis);
          setProcessingStatus({ active: false, progress: 100, text: 'Tailoring analysis complete!' });
          await fetchAnalyses();
        } else if (analysis.status === 'failed') {
          clearInterval(interval);
          setProcessingStatus({ active: false, progress: 0, text: `Tailoring failed: ${analysis.errorMessage || 'Unknown error'}` });
          alert(`Job alignment simulation failed: ${analysis.errorMessage}`);
        } else {
          setProcessingStatus(prev => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 95),
            text: 'Simulating mock interview questions tailored to identified skill gaps...',
          }));
        }
      } catch (error) {
        clearInterval(interval);
        setProcessingStatus({ active: false, progress: 0, text: 'Error polling tailoring results.' });
        console.error('Error polling job analysis status:', error);
      }
    }, 1500);
  };

  // Trigger Job Description Matching
  const runJobMatching = async (resumeId, jobTitle, jobDescription) => {
    setProcessingStatus({ active: true, progress: 15, text: 'Initiating role comparison engine...' });

    try {
      const res = await api.post('/analysis', { resumeId, jobTitle, jobDescription });
      const { jobAnalysis } = res.data;
      
      pollJobAnalysisStatus(jobAnalysis._id);
      return { success: true, analysisId: jobAnalysis._id };
    } catch (error) {
      setProcessingStatus({ active: false, progress: 0, text: '' });
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to run matching simulation.',
      };
    }
  };

  const getResumeById = async (id) => {
    try {
      const res = await api.get(`/resumes/${id}`);
      setCurrentResume(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching single resume:', error);
    }
  };

  const getJobAnalysisById = async (id) => {
    try {
      const res = await api.get(`/analysis/${id}`);
      setCurrentAnalysis(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching single analysis:', error);
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        resumes,
        currentResume,
        analyses,
        currentAnalysis,
        processingStatus,
        fetchResumes,
        fetchAnalyses,
        uploadResumeFile,
        runJobMatching,
        getResumeById,
        getJobAnalysisById,
        setCurrentResume,
        setCurrentAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};
