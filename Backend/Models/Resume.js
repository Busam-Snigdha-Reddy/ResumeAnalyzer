import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      default: '',
    },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      skills: [String],
      education: [
        {
          degree: String,
          institution: String,
          year: String,
        },
      ],
      experience: [
        {
          role: String,
          company: String,
          duration: String,
          description: String,
        },
      ],
    },
    generalFeedback: {
      atsScore: { type: Number, default: 0 },
      formattingScore: { type: Number, default: 0 },
      impactScore: { type: Number, default: 0 },
      suggestions: [
        {
          category: String, // e.g. 'formatting', 'keywords', 'experience'
          message: String,
          textSnippet: String, // The exact text snippet in the resume if applicable
          severity: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' }
        }
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: String,
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model('Resume', resumeSchema);
