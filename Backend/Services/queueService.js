import axios from 'axios';
import { JobQueue } from '../Models/JobQueue.js';
import { Resume } from '../Models/Resume.js';
import { JobAnalysis } from '../Models/JobAnalysis.js';
import { parsePdf, parseDocx } from '../utils/parser.js';
import { aiService } from './aiService.js';

let isProcessing = false;

export const startQueueWorker = () => {
  console.log('Asynchronous Job Queue Worker Started.');
  
  setInterval(async () => {
    if (isProcessing) return;
    
    let job = null;
    try {
      job = await JobQueue.findOne({ status: 'pending' }).sort({ createdAt: 1 });
      if (!job) return;

      isProcessing = true;
      job.status = 'processing';
      await job.save();

      console.log(`Processing background job: ${job.name} (ID: ${job._id})`);

      if (job.name === 'parse_resume') {
        const { resumeId } = job.data;
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
          throw new Error('Resume record not found.');
        }

        // Fetch document file from Cloudinary storage
        console.log(`Downloading file from Cloudinary: ${resume.cloudinaryUrl}`);
        const response = await axios.get(resume.cloudinaryUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        // Parse extracted text
        let text = '';
        if (resume.mimeType === 'application/pdf') {
          text = await parsePdf(buffer);
        } else {
          text = await parseDocx(buffer);
        }

        // Run local parsing matching engine
        const analysis = await aiService.analyzeResume(text);

        // Update resume details
        await Resume.findByIdAndUpdate(resumeId, {
          rawText: text,
          parsedData: {
            name: analysis.name,
            email: analysis.email,
            phone: analysis.phone,
            skills: analysis.skills,
            education: analysis.education,
            experience: analysis.experience,
          },
          generalFeedback: {
            atsScore: analysis.atsScore || 0,
            formattingScore: analysis.formattingScore || 0,
            impactScore: analysis.impactScore || 0,
            suggestions: analysis.suggestions || [],
          },
          status: 'completed',
        });

        job.status = 'completed';
        job.result = { resumeId };
        await job.save();
        console.log(`Job ${job._id} (parse_resume) completed successfully.`);

      } else if (job.name === 'analyze_job') {
        const { jobAnalysisId, resumeId, jobDescription } = job.data;
        
        const resume = await Resume.findById(resumeId);
        if (!resume) {
          throw new Error('Resume associated with job analysis not found.');
        }

        // Run local matching comparison engine
        const analysisResult = await aiService.analyzeJobMatching(resume.rawText, jobDescription);

        await JobAnalysis.findByIdAndUpdate(jobAnalysisId, {
          matchScore: analysisResult.matchScore || 0,
          keywordAnalysis: analysisResult.keywordAnalysis || { matched: [], missing: [] },
          tailoringTips: analysisResult.tailoringTips || [],
          mockInterviewQuestions: analysisResult.mockInterviewQuestions || [],
          status: 'completed',
        });

        job.status = 'completed';
        job.result = { jobAnalysisId };
        await job.save();
        console.log(`Job ${job._id} (analyze_job) completed successfully.`);
      }

    } catch (error) {
      console.error('Queue Processing Error:', error);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
        await job.save();

        if (job.name === 'parse_resume') {
          await Resume.findByIdAndUpdate(job.data.resumeId, { status: 'failed', errorMessage: error.message });
        } else if (job.name === 'analyze_job') {
          await JobAnalysis.findByIdAndUpdate(job.data.jobAnalysisId, { status: 'failed', errorMessage: error.message });
        }
      }
    } finally {
      isProcessing = false;
    }
  }, 1000);
};

export const enqueueJob = async (name, data) => {
  const job = new JobQueue({ name, data });
  await job.save();
  return job;
};
