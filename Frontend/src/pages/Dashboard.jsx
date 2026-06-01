import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { FileText, Cpu, Trash2, Calendar, ChevronRight, BarChart2, Plus } from 'lucide-react';
import api from '../services/api';

export const Dashboard = () => {
  const { resumes, analyses, fetchResumes, fetchAnalyses, setCurrentResume, setCurrentAnalysis } = useAnalysis();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
    fetchAnalyses();
  }, [fetchResumes, fetchAnalyses]);

  const handleDeleteResume = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this resume? All associated job analyses will be lost.')) {
      try {
        await api.delete(`/resumes/${id}`);
        fetchResumes();
        fetchAnalyses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleResumeClick = (resume) => {
    setCurrentResume(resume);
    navigate(`/analysis-result?resumeId=${resume._id}`);
  };

  const handleAnalysisClick = (analysis) => {
    setCurrentAnalysis(analysis);
    navigate(`/analysis-result?resumeId=${analysis.resume._id}&analysisId=${analysis._id}`);
  };

  // Metrics calculation
  const completedResumes = resumes.filter(r => r.status === 'completed');
  const avgAtsScore = completedResumes.length > 0 
    ? Math.round(completedResumes.reduce((acc, curr) => acc + (curr.generalFeedback?.atsScore || 0), 0) / completedResumes.length)
    : 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Upper Metrics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Resumes</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{resumes.length}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average ATS Score</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">
              {avgAtsScore > 0 ? `${avgAtsScore}%` : 'N/A'}
            </h3>
          </div>
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tailoring Simulations</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{analyses.length}</h3>
          </div>
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resumes List Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Your Resumes</h2>
            <Link
              to="/upload"
              className="flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Upload New
            </Link>
          </div>

          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl text-center">
              <FileText className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 font-semibold mb-2">No Resumes Uploaded Yet</p>
              <p className="text-slate-500 text-xs max-w-sm mb-4">
                Upload your PDF or DOCX resume to extract skills and overlay ATS formatting improvements.
              </p>
              <Link
                to="/upload"
                className="text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700/50 px-4 py-2 rounded-xl hover:bg-slate-700 transition-all"
              >
                Upload First Resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  onClick={() => handleResumeClick(resume)}
                  className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/30 hover:border-slate-700/60 hover:bg-slate-900/50 cursor-pointer flex flex-col justify-between transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="p-2.5 bg-slate-950/80 border border-slate-800 text-indigo-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    {resume.status === 'completed' ? (
                      <span className="text-xl font-bold bg-slate-950/80 text-emerald-400 px-3 py-1 rounded-full border border-slate-800">
                        {resume.generalFeedback?.atsScore}%
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        resume.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        resume.status === 'processing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {resume.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[200px] mb-1 group-hover:text-indigo-400 transition-colors">
                      {resume.originalName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 mt-4 pt-4">
                    <span className="text-[10px] text-slate-400">
                      {resume.parsedData?.skills?.length || 0} Skills Detected
                    </span>
                    <button
                      onClick={(e) => handleDeleteResume(resume._id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tailored Analysis Column */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Role Tailoring</h2>
          
          {analyses.length === 0 ? (
            <div className="p-6 border border-slate-800/80 bg-slate-900/10 rounded-2xl text-center text-slate-500 text-sm">
              No comparisons completed. Open a resume to tailor it for a specific job description.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis._id}
                  onClick={() => handleAnalysisClick(analysis)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex flex-col min-w-0 pr-4">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-all">
                      {analysis.jobTitle}
                    </h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 truncate">
                      Resume: {analysis.resume?.originalName || 'Deleted'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded">
                      {analysis.matchScore}% Match
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
