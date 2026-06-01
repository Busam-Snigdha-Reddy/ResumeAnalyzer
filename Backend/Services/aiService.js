/**
 * Predefined local engineering interview questions matrix mapped to technical keywords
 */
const QUESTION_MATRIX = {
  KUBERNETES: {
    question: "Explain the core components of Kubernetes architecture and how it manages pod orchestration.",
    suggestedAnswerKey: "Must mention API Server, etcd, Scheduler, Controller Manager, and Kubelet. Detail self-healing, scaling, and rolling updates.",
    focusArea: "Kubernetes Orchestration"
  },
  DOCKER: {
    question: "What is the difference between a Docker image and a container? How do you optimize Dockerfiles for production?",
    suggestedAnswerKey: "Images are read-only templates; containers are active runnable instances. Optimization covers multi-stage builds, minimizing layers, and using alpine/distroless bases.",
    focusArea: "Docker Containerization"
  },
  REACT: {
    question: "Explain the React reconciliation process and the purpose of the Virtual DOM.",
    suggestedAnswerKey: "Detail the diffing algorithm (O(n) complexity heuristics), key props role, batching updates, and fiber architecture.",
    focusArea: "React Architecture"
  },
  AWS: {
    question: "How would you design a secure, high-availability web architecture on AWS?",
    suggestedAnswerKey: "Describe Multi-AZ deployments, Application Load Balancers, Route53 DNS routing, Auto Scaling groups, and VPC private subnets with NAT gateways.",
    focusArea: "AWS Cloud Design"
  },
  'NODE.JS': {
    question: "Explain the Node.js event loop structure and how it handles non-blocking I/O operations.",
    suggestedAnswerKey: "Detail the phases (Timers, Pending, Poll, Check, Close callbacks), microtask queues (process.nextTick, Promise), and libuv thread pool operations.",
    focusArea: "Node.js Concurrency"
  },
  MONGODB: {
    question: "When would you choose MongoDB over a relational database like PostgreSQL? Detail index optimization.",
    suggestedAnswerKey: "MongoDB offers dynamic JSON schemas, horizontal scaling (sharding), and high write availability. Mentions index creation, compound keys, and explain plans.",
    focusArea: "Database Selection & Indexes"
  },
  'SYSTEM DESIGN': {
    question: "How would you design a scalable real-time notification system serving millions of active users?",
    suggestedAnswerKey: "Use WebSockets or SSE for real-time push. Include message brokers (Kafka/RabbitMQ) for queuing, Redis for caching connection registry, and worker pools.",
    focusArea: "Scalable System Architecture"
  },
  JAVASCRIPT: {
    question: "Explain closures, prototypal inheritance, and the 'this' keyword bind behaviors in JavaScript.",
    suggestedAnswerKey: "Explain lexical scoping, the prototype chain, arrow function vs normal function scopes, and call/apply/bind utilities.",
    focusArea: "Advanced JavaScript"
  },
  PYTHON: {
    question: "Explain how memory management works in Python. What is the Global Interpreter Lock (GIL)?",
    suggestedAnswerKey: "Reference reference counting, cycle-detecting garbage collection, and GIL limit to single-threaded CPU executions in CPython.",
    focusArea: "Python Core Internals"
  },
  EXPRESS: {
    question: "How does middleware execution work in Express.js? Explain error handling conventions.",
    suggestedAnswerKey: "Detail the request-response-next cycle, order-dependent routing, and error-handling middleware parameters (err, req, res, next).",
    focusArea: "Express Middleware Routing"
  }
};

/**
 * Standard Tech Skills Dictionary
 */
const TECH_DICTIONARY = [
  'REACT', 'NODE.JS', 'EXPRESS', 'MONGODB', 'JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'DOCKER', 'KUBERNETES',
  'AWS', 'HTML', 'CSS', 'SQL', 'POSTGRESQL', 'SYSTEM DESIGN', 'GIT', 'CI/CD', 'REDIS', 'GRAPHQL',
  'JAVA', 'C++', 'RUBY', 'PHP', 'ANGULAR', 'VUE', 'NEXT.JS', 'NESTJS', 'LINUX'
];

/**
 * Helper to normalize and clean text snippets
 */
const cleanSnippetText = (text) => {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
};

export const aiService = {
  /**
   * Local Parser Service extracting fields using regex and word dictionaries
   */
  analyzeResume: async (text) => {
    const textLower = text.toLowerCase();
    
    // 1. Extract Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : 'candidate@example.com';

    // 2. Extract Phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '555-0100';

    // 3. Extract Name: Take first alphanumeric line
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    let name = 'Candidate Name';
    for (const line of lines) {
      if (/^[a-zA-Z\s]{3,30}$/.test(line)) {
        name = line;
        break;
      }
    }

    // 4. Extract Skills using tech dictionary matching
    const skills = [];
    TECH_DICTIONARY.forEach(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(textLower)) {
        skills.push(skill);
      }
    });

    if (skills.length === 0) {
      skills.push('JavaScript', 'CSS', 'Web Development');
    }

    // 5. Structure Mock Experience & Education based on layout detection
    const experience = [];
    const education = [];

    // Parse simple sections
    const expRegex = /(?:experience|employment|work history)([\s\S]*?)(?:education|skills|projects|$)/i;
    const eduRegex = /(?:education|academic)([\s\S]*?)(?:experience|skills|projects|interests|$)/i;

    const expMatch = text.match(expRegex);
    const eduMatch = text.match(eduRegex);

    if (expMatch && expMatch[1]) {
      const expLines = expMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 15);
      expLines.slice(0, 3).forEach(line => {
        experience.push({
          role: 'Software Engineer',
          company: 'Technology Solutions',
          duration: '2022 - Present',
          description: line
        });
      });
    }

    if (experience.length === 0) {
      experience.push({
        role: 'Full Stack Engineer',
        company: 'InnovateTech Inc.',
        duration: '2022 - Present',
        description: 'Developed and optimized user interfaces and RESTful database endpoints.'
      });
    }

    if (eduMatch && eduMatch[1]) {
      const eduLines = eduMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 8);
      if (eduLines.length > 0) {
        education.push({
          degree: eduLines[0],
          institution: 'University of Science & Tech',
          year: '2022'
        });
      }
    }

    if (education.length === 0) {
      education.push({
        degree: 'Bachelor of Science in Computer Science',
        institution: 'State University',
        year: '2021'
      });
    }

    // 6. Formatting Checks & Suggestions
    const suggestions = [];
    
    // Check for action verbs
    const actionVerbs = ['led', 'built', 'developed', 'designed', 'optimized', 'engineered', 'implemented', 'created'];
    const hasVerbs = actionVerbs.some(verb => textLower.includes(verb));
    
    let lineToHighlight = lines.find(l => l.length > 25) || 'Worked as developer';

    if (!hasVerbs) {
      suggestions.push({
        category: 'experience',
        message: 'Start bullet points with strong action verbs (e.g., Optimized, Engineered, Designed) to quantify accomplishments.',
        textSnippet: cleanSnippetText(lineToHighlight),
        severity: 'high'
      });
    }

    // Check skills section density
    if (skills.length < 5) {
      suggestions.push({
        category: 'keywords',
        message: 'Your technical skills index is thin. Add secondary stack skills like Git, Docker, or SQL.',
        textSnippet: cleanSnippetText(lines.find(l => l.toLowerCase().includes('skill') || l.toLowerCase().includes('tech')) || lineToHighlight),
        severity: 'medium'
      });
    }

    // Add layout suggestion
    suggestions.push({
      category: 'formatting',
      message: 'Maintain explicit line heights and standard headings to enable seamless ATS indexing.',
      textSnippet: cleanSnippetText(lines[0] || 'Resume Header'),
      severity: 'low'
    });

    const skillsCount = skills.length;
    const atsScore = Math.min(60 + (skillsCount * 3), 96);
    const formattingScore = 85;
    const impactScore = hasVerbs ? 80 : 60;

    return {
      name,
      email,
      phone,
      skills,
      education,
      experience,
      atsScore,
      formattingScore,
      impactScore,
      suggestions
    };
  },

  /**
   * Local Matching Algorithm comparing Resume vs Job Description
   */
  analyzeJobMatching: async (resumeText, jobDescription) => {
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();

    const matched = [];
    const missing = [];

    // Parse job requirements against our technical dictionary
    TECH_DICTIONARY.forEach(skill => {
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');

      if (regex.test(jdLower)) {
        if (regex.test(resumeLower)) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      }
    });

    // Handle fallbacks if job description does not list standard dictionary skills
    if (matched.length === 0 && missing.length === 0) {
      TECH_DICTIONARY.slice(0, 3).forEach(skill => {
        if (resumeLower.includes(skill.toLowerCase())) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      });
    }

    const totalJdSkills = matched.length + missing.length;
    const matchScore = totalJdSkills > 0 ? Math.round((matched.length / totalJdSkills) * 100) : 50;

    // Generate custom tailoring tips
    const tailoringTips = [];
    missing.slice(0, 3).forEach(skill => {
      tailoringTips.push({
        section: 'skills',
        action: 'add',
        suggestion: `Integrate the technical skill keyword '${skill}' inside your skills grid to pass automatic parsing filters.`
      });
    });

    tailoringTips.push({
      section: 'experience',
      action: 'modify',
      suggestion: 'Quantify metrics inside your bullet points. Show scale of operations and software lifecycle achievements.'
    });

    // Map missing skills to mock interview questions
    const mockInterviewQuestions = [];
    missing.forEach(skill => {
      if (QUESTION_MATRIX[skill]) {
        mockInterviewQuestions.push(QUESTION_MATRIX[skill]);
      }
    });

    // Provide default questions if missing array yields no direct matrix matches
    if (mockInterviewQuestions.length === 0) {
      matched.slice(0, 2).forEach(skill => {
        if (QUESTION_MATRIX[skill]) {
          mockInterviewQuestions.push(QUESTION_MATRIX[skill]);
        }
      });
    }

    if (mockInterviewQuestions.length === 0) {
      mockInterviewQuestions.push({
        question: "Explain a complex engineering feature you built recently. What architectural constraints did you face?",
        suggestedAnswerKey: "State problem clearly, outline software pattern selected, detail data design choices, and mention scale metrics.",
        focusArea: "General Engineering Fit"
      });
    }

    return {
      matchScore,
      keywordAnalysis: {
        matched,
        missing
      },
      tailoringTips,
      mockInterviewQuestions
    };
  }
};
