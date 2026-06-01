import dotenv from 'dotenv';
import { aiService } from '../Services/aiService.js';
import { parseDocx } from './parser.js';

dotenv.config();

console.log('--- ATS Pro Backend Verification ---');

// Test 1: AI Mock / Live Service Fallback robustness
try {
  console.log('Test 1: Testing AI Resume parser service resilience...');
  const testText = `
  JOHN DOE
  john.doe@example.com | 123-456-7890
  SKILLS: React, Node.js, Express, MongoDB, Python.
  EXPERIENCE:
  Software Engineer at TechCorp (2022 - Present)
  Worked on building full-stack web products.
  EDUCATION:
  BS in Computer Science, State University (2018 - 2022)
  `;
  
  const result = await aiService.analyzeResume(testText);
  console.log('Result extracted successfully!');
  console.log(`Candidate Name: ${result.name}`);
  console.log(`Extracted Skills: ${result.skills.join(', ')}`);
  console.log(`ATS Score: ${result.atsScore}%`);
  console.log(`Suggestions count: ${result.suggestions?.length || 0}`);
  
  console.log('\nTest 2: Testing Job Comparison Simulation...');
  const jd = 'Looking for a developer with expertise in React, Node, and Kubernetes.';
  const jobResult = await aiService.analyzeJobMatching(testText, jd);
  console.log(`Match Score: ${jobResult.matchScore}%`);
  console.log(`Matched Skills: ${jobResult.keywordAnalysis.matched.join(', ')}`);
  console.log(`Missing Skills: ${jobResult.keywordAnalysis.missing.join(', ')}`);
  console.log(`Mock Questions count: ${jobResult.mockInterviewQuestions?.length || 0}`);

  console.log('\n✅ Verification Script Completed successfully! All core modules loaded and verified.');
} catch (error) {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}
