import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Cpu, ShieldCheck, Sparkles, Award } from 'lucide-react';

export const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Badge Banner */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 mb-8 animate-fade-in shadow-xl">
        <Sparkles className="w-3.5 h-3.5" />
        Now Powered by Gemini 2.5 Flash
      </div>

      {/* Hero Headline */}
      <h1 className="max-w-4xl text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 font-display">
        Optimize Your Resume with{' '}
        <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
          Coordinate-Mapped AI
        </span>
      </h1>

      <p className="max-w-2xl text-slate-400 text-lg sm:text-xl mb-10 leading-relaxed">
        ATS Pro scans layout formatting, calculates keyword gaps, and overlays AI improvements directly onto your resume coordinates. Run mock role simulations to prep for interviews.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-20">
        {user ? (
          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.03] transition-all"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/signup"
              className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.03] transition-all"
            >
              Start Analysing Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-bold bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-white hover:scale-[1.03] transition-all"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
        <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-fit mb-6">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Interactive Score Canvas</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            See exactly where issues lie. Visual coordinates overlay flags sections, lines, and formatting flaws directly on top of the rendered canvas.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Role-Tailored Gap Engine</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Compare your resume directly with job descriptions. Extract matched vs missing skills and receive custom bullet points instructions.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl w-fit mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Mock Role Simulation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Practice interview questions generated on the fly. Focus entirely on the missing elements flagged during ATS tailoring.
          </p>
        </div>
      </div>
    </div>
  );
};
