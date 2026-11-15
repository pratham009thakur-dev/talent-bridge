const fs = require('fs');
const pdfParse = require('pdf-parse');

const COMMON_SKILLS_DICTIONARY = [
  'javascript', 'typescript', 'react', 'react.js', 'node', 'node.js', 'express',
  'express.js', 'mongodb', 'sql', 'mysql', 'postgresql', 'python', 'fastapi',
  'django', 'flask', 'c++', 'java', 'spring boot', 'html', 'css', 'tailwind',
  'tailwindcss', 'bootstrap', 'docker', 'kubernetes', 'aws', 'azure', 'git',
  'github', 'rest api', 'graphql', 'redux', 'next.js', 'linux', 'ci/cd',
  'jest', 'unit testing', 'agile', 'scrum', 'data analysis', 'machine learning'
];

/**
 * Extracts raw text from a PDF file using pdf-parse buffer scanning.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsedData = await pdfParse(dataBuffer);
    return parsedData.text || '';
  } catch (error) {
    console.error(`[Resume Parser] Failed to parse PDF at ${filePath}:`, error.message);
    throw new Error('Could not parse the PDF file. Ensure it is not password protected.');
  }
};

/**
 * Rule-based information extraction from raw resume text.
 */
const parseResumeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      extractedName: '',
      extractedEmail: '',
      extractedPhone: '',
      extractedSkills: [],
      experienceYears: 0,
      educationHints: [],
    };
  }

  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Email extraction regex
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emailMatches = cleanText.match(emailRegex);
  const extractedEmail = emailMatches && emailMatches.length > 0 ? emailMatches[0].toLowerCase() : '';

  // 2. Phone number extraction regex (Indian / International patterns)
  const phoneRegex = /(?:(?:\+|0{0,2})91[\s-]?)?[6789]\d{9}|(?:\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const phoneMatches = cleanText.match(phoneRegex);
  const extractedPhone = phoneMatches && phoneMatches.length > 0 ? phoneMatches[0].trim() : '';

  // 3. Name heuristic (inspecting top lines that aren't emails or headers)
  let extractedName = '';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      !line.includes('@') &&
      !line.match(/\d/) &&
      line.length >= 3 &&
      line.length <= 40 &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum')
    ) {
      extractedName = line;
      break;
    }
  }

  // 4. Skills extraction against standard technical taxonomy
  const lowerText = cleanText.toLowerCase();
  const detectedSkills = [];

  COMMON_SKILLS_DICTIONARY.forEach((skill) => {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText)) {
      detectedSkills.push(skill);
    }
  });

  // 5. Total experience approximation (looking for "X+ years", "X years of experience")
  let experienceYears = 0;
  const expRegex = /(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/gi;
  const expMatch = expRegex.exec(lowerText);
  if (expMatch && expMatch[1]) {
    experienceYears = parseInt(expMatch[1], 10);
  }

  // 6. Education degree heuristics
  const degreeKeywords = ['b.tech', 'bachelor', 'b.e.', 'm.tech', 'master', 'mca', 'bca', 'diploma', 'ph.d', 'degree'];
  const educationHints = [];
  lines.forEach((line) => {
    const lowerLine = line.toLowerCase();
    degreeKeywords.forEach((deg) => {
      if (lowerLine.includes(deg) && !educationHints.includes(line)) {
        educationHints.push(line.substring(0, 120));
      }
    });
  });

  return {
    extractedName,
    extractedEmail,
    extractedPhone,
    extractedSkills: Array.from(new Set(detectedSkills)),
    experienceYears,
    educationHints: educationHints.slice(0, 3),
  };
};

module.exports = {
  extractTextFromPDF,
  parseResumeText,
};