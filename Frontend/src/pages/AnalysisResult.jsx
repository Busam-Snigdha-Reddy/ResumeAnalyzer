import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { ResumeCanvasOverlay } from '../components/ResumeCanvasOverlay';
import { LayoutDashboard, Award, Sparkles, Cpu, PlayCircle, BookOpen, AlertTriangle } from 'lucide-react';

export const AnalysisResult = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const initialAnalysisId = searchParams.get('analysisId');
  const navigate = useNavigate();

  const {
    currentResume,
    currentAnalysis,
    processingStatus,
    getResumeById,
    getJobAnalysisById,
    runJobMatching,
    setCurrentAnalysis,
  } = useAnalysis();

  const [activeTab, setActiveTab] = useState('ats'); // 'ats', 'tailor', 'simulator'
  
  // Job Tailoring Inputs
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matchingError, setMatchingError] = useState('');
  
  // Mock Interview State
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(null);
  const [revealAnswer, setRevealAnswer] = useState(false);

  useEffect(() => {
    if (resumeId) {
      getResumeById(resumeId);
    }
    if (initialAnalysisId) {
      getJobAnalysisById(initialAnalysisId);
      setActiveTab('tailor');
    } else {
      setCurrentAnalysis(null); // Reset when loading fresh resume
    }
  }, [resumeId, initialAnalysisId]);

  const handleRunTailoring = async (e) => {
    e.preventDefault();
    setMatchingError('');

    if (!jobTitle || !jobDescription) {
      setMatchingError('Please fill in both fields.');
      return;
    }

    const res = await runJobMatching(resumeId, jobTitle, jobDescription);
    if (res.success) {
      // Poll completes and context updates currentAnalysis.
      // We can also route parameters for persistent refresh
      setActiveTab('tailor');
    } else {
      setMatchingError(res.message);
    }
  };

  // Helper to render score circles
  const renderScoreCircle = (score, label, colorClass) => {
    const radius = 35;
    const strokeDash = 2 * Math.PI * radius;
    const offset = strokeDash - (score / 100) * strokeDash;

    return (
      <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-800 bg-slate-900/30">
        <div className="relative flex items-center justify-center h-20 w-20">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r={radius} className="stroke-slate-800 fill-none" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              style={{ strokeDasharray: strokeDash, strokeDashoffset: offset }}
              className={`fill-none transition-all duration-1000 ease-out ${colorClass}`}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-base font-extrabold text-white">{score}%</span>
        </div>
        <span className="text-xs text-slate-400 font-semibold">{label}</span>
      </div>
    );
  };

  if (!currentResume) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-400">Fetching resume details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Upper Status / Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Analysis Suite</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            {currentResume.originalName}
          </h1>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('ats')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ats' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            ATS Evaluation
          </button>
          <button
            onClick={() => setActiveTab('tailor')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tailor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Tailor to Job
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            disabled={!currentAnalysis}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              !currentAnalysis ? 'opacity-40 cursor-not-allowed text-slate-600' :
              activeTab === 'simulator' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Role Simulation
          </button>
        </div>
      </div>

      {/* Main Analysis Panels (Split Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Visual Resume Overlay (takes 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-2">Visual Coordinates Overlay</h3>
          <ResumeCanvasOverlay
            resumeId={currentResume._id}
            fileType={currentResume.mimeType}
            suggestions={currentResume.generalFeedback?.suggestions}
          />
          <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed mt-2">
            Hover over highlighted fields on the canvas to inspect formatting guidelines and keywords suggestions mapped directly from coordinates.
          </p>
        </div>

        {/* Right Column: Tabbed Content (takes 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {processingStatus.active && (
            <div className="p-4 rounded-xl border border-indigo-950 bg-indigo-950/20 text-indigo-300 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-500"></div>
                <span className="text-xs font-bold">Simulating...</span>
              </div>
              <p className="text-xs opacity-90">{processingStatus.text}</p>
            </div>
          )}

          {/* TAB 1: ATS EVALUATION */}
          {activeTab === 'ats' && (
            <div className="flex flex-col gap-6">
              {/* Score Gauges */}
              <div className="grid grid-cols-3 gap-4">
                {renderScoreCircle(currentResume.generalFeedback?.atsScore || 0, 'ATS Score', 'stroke-indigo-500')}
                {renderScoreCircle(currentResume.generalFeedback?.formattingScore || 0, 'Layout/Formatting', 'stroke-violet-500')}
                {renderScoreCircle(currentResume.generalFeedback?.impactScore || 0, 'Impact & Verbs', 'stroke-teal-500')}
              </div>

              {/* Suggestions Section */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4">AI Critical Suggestions</h3>
                
                {currentResume.generalFeedback?.suggestions?.length === 0 ? (
                  <p className="text-slate-400 text-sm">Perfect! No critical formatting issues or keyword gaps detected.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {currentResume.generalFeedback?.suggestions?.map((sug, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start gap-3.5 transition-all"
                      >
                        <span className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                          sug.severity === 'high' ? 'bg-rose-500/10 text-rose-400' :
                          sug.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              {sug.category}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              sug.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                              sug.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-indigo-500/20 text-indigo-400'
                            }`}>
                              {sug.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {sug.message}
                          </p>
                          {sug.textSnippet && (
                            <div className="bg-slate-900/60 p-2 border border-slate-800 rounded text-xs font-mono text-slate-500 mt-2.5 break-all">
                              Snippet: "{sug.textSnippet}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TAILOR TO JOB DESCRIPTION */}
          {activeTab === 'tailor' && (
            <div className="flex flex-col gap-6">
              {!currentAnalysis ? (
                /* Run Comparison form */
                <form onSubmit={handleRunTailoring} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-white">Compare with Job Description</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Insert specific job title and description text to compute percentage match, missing keywords gaps, and generate role simulations.
                  </p>

                  {matchingError && (
                    <div className="p-3 border border-rose-950 bg-rose-950/20 text-rose-300 rounded-lg text-xs font-semibold">
                      {matchingError}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Target Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Full Stack MERN Developer"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Job Description Text</label>
                    <textarea
                      rows="6"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the raw requirements, skills, and qualifications here..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/20 transition-all"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Tailor Resume
                  </button>
                </form>
              ) : (
                /* Comparative results dashboard */
                <div className="flex flex-col gap-6">
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Job Match Score</span>
                      <h4 className="text-slate-400 text-sm mt-0.5">Role: {currentAnalysis.jobTitle}</h4>
                    </div>
                    <span className="text-3xl font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-xl">
                      {currentAnalysis.matchScore}% Match
                    </span>
                  </div>

                  {/* Keyword analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20">
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-3">Matched Keywords</span>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.keywordAnalysis?.matched?.map((word, i) => (
                          <span key={i} className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                            {word}
                          </span>
                        )) || <span className="text-xs text-slate-500">None</span>}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20">
                      <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block mb-3">Missing Keywords</span>
                      <div className="flex flex-wrap gap-2">
                        {currentAnalysis.keywordAnalysis?.missing?.map((word, i) => (
                          <span key={i} className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
                            {word}
                          </span>
                        )) || <span className="text-xs text-slate-500">None</span>}
                      </div>
                    </div>
                  </div>

                  {/* Tailoring Recommendations */}
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
                    <h4 className="text-sm font-bold text-white mb-4">Tailoring Recommendations</h4>
                    <div className="flex flex-col gap-3">
                      {currentAnalysis.tailoringTips?.map((tip, i) => (
                        <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded mt-0.5 ${
                            tip.action === 'add' ? 'bg-emerald-500/20 text-emerald-400' :
                            tip.action === 'modify' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {tip.action}
                          </span>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-0.5">
                              Section: {tip.section}
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{tip.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buttons to restart or start simulator */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentAnalysis(null)}
                      className="flex-1 py-3 text-xs font-bold border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl transition-all"
                    >
                      Compare Another Job
                    </button>
                    <button
                      onClick={() => setActiveTab('simulator')}
                      className="flex-1 py-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                    >
                      Open Role Simulator
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ROLE SIMULATION */}
          {activeTab === 'simulator' && currentAnalysis && (
            <div className="flex flex-col gap-6">
              <div className="p-5 border border-slate-800 bg-slate-900/10 rounded-2xl">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mb-1">Interactive Simulation</span>
                <h3 className="text-lg font-bold text-white mb-2">Mock Interview Coach</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Practice responding to technical questions generated entirely from the skill gaps detected during your alignment tailoring check.
                </p>
              </div>

              {/* Questions stack */}
              <div className="flex flex-col gap-3">
                {currentAnalysis.mockInterviewQuestions?.map((q, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-2xl cursor-pointer transition-all ${
                      selectedQuestionIdx === idx
                        ? 'border-indigo-500/60 bg-indigo-500/[0.03]'
                        : 'border-slate-800 bg-slate-900/10 hover:border-slate-700/80 hover:bg-slate-900/35'
                    }`}
                    onClick={() => {
                      setSelectedQuestionIdx(idx);
                      setRevealAnswer(false);
                    }}
                  >
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          Topic: {q.focusArea || 'General Fit'}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                          {q.question}
                        </h4>
                      </div>
                      <BookOpen className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        selectedQuestionIdx === idx ? 'text-indigo-400' : 'text-slate-600'
                      }`} />
                    </div>

                    {selectedQuestionIdx === idx && (
                      <div className="px-4 pb-4 border-t border-slate-800/80 pt-4 mt-2">
                        {revealAnswer ? (
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-300">
                            <span className="font-extrabold uppercase text-[10px] text-emerald-400 tracking-wider block mb-2">
                              Suggested Strong Answer Key
                            </span>
                            {q.suggestedAnswerKey}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealAnswer(true);
                            }}
                            className="w-full py-2.5 text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl transition-all"
                          >
                            Reveal Suggested Answer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
