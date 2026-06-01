import { JobAnalysis } from '../Models/JobAnalysis.js';
import { Resume } from '../Models/Resume.js';
import { enqueueJob } from '../Services/queueService.js';

export const createJobAnalysis = async (req, res, next) => {
  const { resumeId, jobTitle, jobDescription } = req.body;

  if (!resumeId || !jobTitle || !jobDescription) {
    return res.status(400).json({ message: 'resumeId, jobTitle, and jobDescription are required.' });
  }

  try {
    // Check if the resume exists and belongs to the user
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    if (resume.status !== 'completed') {
      return res.status(400).json({ message: 'Resume is still being parsed. Please try again when parsing is completed.' });
    }

    const jobAnalysis = new JobAnalysis({
      user: req.user._id,
      resume: resumeId,
      jobTitle,
      jobDescription,
      status: 'pending',
    });

    await jobAnalysis.save();

    // Enqueue job comparison task
    const job = await enqueueJob('analyze_job', {
      jobAnalysisId: jobAnalysis._id,
      resumeId,
      jobDescription,
    });

    res.status(202).json({
      message: 'Job description comparison started.',
      jobAnalysis,
      jobId: job._id,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobAnalyses = async (req, res, next) => {
  try {
    const analyses = await JobAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    next(error);
  }
};

export const getJobAnalysisById = async (req, res, next) => {
  try {
    const analysis = await JobAnalysis.findOne({ _id: req.params.id, user: req.user._id }).populate('resume');

    if (!analysis) {
      return res.status(404).json({ message: 'Job description analysis not found.' });
    }

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};
