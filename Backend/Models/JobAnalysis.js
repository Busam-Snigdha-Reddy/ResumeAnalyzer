import mongoose from 'mongoose';

const jobAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    keywordAnalysis: {
      matched: [String],
      missing: [String],
    },
    tailoringTips: [
      {
        section: String, // e.g. 'summary', 'experience', 'skills'
        action: String, // 'add', 'modify', 'remove'
        suggestion: String,
      }
    ],
    mockInterviewQuestions: [
      {
        question: String,
        suggestedAnswerKey: String,
        focusArea: String,
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

export const JobAnalysis = mongoose.model('JobAnalysis', jobAnalysisSchema);
