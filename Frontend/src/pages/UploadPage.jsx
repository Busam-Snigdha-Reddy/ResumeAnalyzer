import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

export const UploadPage = () => {
  const { uploadResumeFile, processingStatus } = useAnalysis();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOver(true);
    } else if (e.type === 'dragleave') {
      setDragOver(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const allowedExtensions = ['pdf', 'docx'];
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setError('Invalid file type. Only PDF and DOCX documents are accepted.');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum supported size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setError('');
    const res = await uploadResumeFile(file);
    if (res.success) {
      // Polling is started inside the context; wait for redirect to trigger inside polling loop or redirect manually on completion.
      // We can also poll directly on this page or watch currentResume.
      // To ensure a smooth transition, we check processing status and route once currentResume changes.
      // But the context pollResumeStatus sets currentResume, so let's monitor that!
    } else {
      setError(res.message);
    }
  };

  // Watch for completed resume to redirect automatically
  React.useEffect(() => {
    const checkRedirect = async () => {
      // If a resume has just completed processing, redirect to the result page
      if (processingStatus.progress === 100) {
        // Find the newly uploaded completed resume or let the context set currentResume
        // We trigger manual navigation inside context or here.
        // Let's redirect when progress completes.
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    };
    checkRedirect();
  }, [processingStatus.progress, navigate]);

  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Upload Resume</h2>
        <p className="text-slate-400 text-sm">
          Submit your PDF or DOCX file to run ATS checks and visual layout feedback overlays.
        </p>
      </div>

      {processingStatus.active ? (
        /* Processing Queue Progress view */
        <div className="w-full p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse"></div>
            <div className="relative p-5 bg-slate-950 border border-slate-800 text-indigo-400 rounded-full animate-bounce">
              <UploadCloud className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Analyzing Resume</h3>
          <p className="text-slate-400 text-xs mb-6 max-w-xs">{processingStatus.text}</p>
          
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 mb-2">
            <div
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${processingStatus.progress}%` }}
            />
          </div>
          <span className="text-xs text-indigo-400 font-bold">{processingStatus.progress}% Complete</span>
        </div>
      ) : (
        /* Drag & Drop Input Form */
        <div className="w-full flex flex-col gap-6">
          {error && (
            <div className="p-4 border border-rose-950 bg-rose-950/20 text-rose-300 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative p-10 border-2 border-dashed rounded-2xl flex flex-col items-center text-center justify-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/5'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            
            <div className="p-4 bg-slate-950/80 border border-slate-800 text-slate-400 rounded-2xl mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>
            
            <p className="text-slate-300 font-semibold mb-1">
              Drag & Drop your resume file here
            </p>
            <p className="text-slate-500 text-xs mb-4">or click to browse from directory</p>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              PDF or DOCX (Max 10MB)
            </span>
          </div>

          {file && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate max-w-[280px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
              >
                Analyze File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
