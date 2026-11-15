/**
 * Practical, Deterministic Job Matching Engine.
 * Computes transparent percentage and skill differential between a candidate and a job opening.
 *
 * Scoring Breakdown (Total: 100%):
 * 1. Skill Match: 60%
 * 2. Experience Level Match: 25%
 * 3. Location / Remote Preference Match: 15%
 */
const calculateMatch = (candidateProfile, job) => {
    if (!candidateProfile || !job) {
      return {
        percentage: 0,
        matchingSkills: [],
        missingSkills: [],
        explanation: 'Missing candidate or job details for evaluation.',
      };
    }
  
    const candidateSkills = (candidateProfile.skills || []).map((s) => s.toLowerCase().trim());
    const requiredSkills = (job.skillsRequired || []).map((s) => s.toLowerCase().trim());
  
    // 1. Skill calculation
    const matchingSkills = [];
    const missingSkills = [];
  
    requiredSkills.forEach((reqSkill) => {
      if (candidateSkills.includes(reqSkill)) {
        matchingSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });
  
    let skillScore = 0;
    if (requiredSkills.length > 0) {
      const ratio = matchingSkills.length / requiredSkills.length;
      skillScore = ratio * 60; // Max 60 points
    } else {
      skillScore = 60; // If no specific skills required, give full marks
    }
  
    // 2. Experience calculation (Max 25 points)
    let expScore = 0;
    const candidateExp = Number(candidateProfile.experienceYears) || 0;
    const requiredMinExp = Number(job.minExperienceYears) || 0;
  
    if (candidateExp >= requiredMinExp) {
      expScore = 25;
    } else if (requiredMinExp > 0) {
      const expRatio = candidateExp / requiredMinExp;
      expScore = Math.max(0, Math.round(expRatio * 25));
    } else {
      expScore = 25;
    }
  
    // 3. Location calculation (Max 15 points)
    let locScore = 0;
    const jobCity = (job.location?.city || '').toLowerCase().trim();
    const candidateCity = (candidateProfile.location?.city || '').toLowerCase().trim();
  
    if (job.location?.isRemote || (jobCity && candidateCity && jobCity === candidateCity)) {
      locScore = 15;
    } else if (candidateProfile.location?.country && job.location?.country && 
               candidateProfile.location.country.toLowerCase() === job.location.country.toLowerCase()) {
      locScore = 8;
    }
  
    const totalScore = Math.min(100, Math.round(skillScore + expScore + locScore));
  
    let explanation = '';
    if (totalScore >= 80) {
      explanation = 'Strong fit across key required skills and core qualification parameters.';
    } else if (totalScore >= 50) {
      explanation = 'Moderate fit. Some required skills are missing, but core requirements are met.';
    } else {
      explanation = 'Low fit. Candidate lacks several required core skills or requisite experience.';
    }
  
    return {
      percentage: totalScore,
      matchingSkills,
      missingSkills,
      explanation,
    };
  };
  
  module.exports = { calculateMatch };