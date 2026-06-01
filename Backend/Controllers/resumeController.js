import axios from 'axios';
import { Resume } from '../Models/Resume.js';
import { enqueueJob } from '../Services/queueService.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Promise wrapper for Cloudinary upload stream
 */
const uploadToCloudinary = (fileBuffer, fileName) => {
  // Sanitize the filename to only contain alphanumeric characters, hyphens, and underscores
  const cleanFileName = fileName.split('.')[0]
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '');

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: `resumes/${Date.now()}-${cleanFileName}`
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.write(fileBuffer);
    uploadStream.end();
  });
};

export const uploadResume = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    console.log(`Uploading file ${req.file.originalname} to Cloudinary...`);
    const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    console.log('Cloudinary Upload Succeeded:', uploadResult.secure_url);

    const resume = new Resume({
      user: req.user._id,
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      status: 'pending',
    });

    await resume.save();

    // Enqueue the background processing task
    const job = await enqueueJob('parse_resume', {
      resumeId: resume._id,
    });

    res.status(202).json({
      message: 'Resume upload accepted and stored. Parsing started.',
      resume,
      jobId: job._id,
    });
  } catch (error) {
    console.error('Cloudinary controller error:', error);
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * Proxies downloads from Cloudinary to bypass canvas CORS limitations on frontend.
 */
export const getResumeFile = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Stream directly from Cloudinary back to client
    const response = await axios.get(resume.cloudinaryUrl, { responseType: 'stream' });
    
    res.set({
      'Content-Type': resume.mimeType,
      'Content-Disposition': `inline; filename="${resume.originalName}"`,
    });
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Failed to proxy resume download stream:', error);
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Remove from Cloudinary storage
    try {
      await cloudinary.uploader.destroy(resume.cloudinaryId, { resource_type: 'raw' });
    } catch (err) {
      console.warn('Failed to delete file from Cloudinary, continuing record removal:', err);
    }

    await Resume.findByIdAndDelete(resume._id);
    res.json({ message: 'Resume and hosting files deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
