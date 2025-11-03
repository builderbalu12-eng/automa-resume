import { ResumeData, JobDescription, ATSScore } from "@/types";

export function analyzeATSCompatibility(
  resume: ResumeData,
  jobDescription: JobDescription
): ATSScore {
  const resumeText = buildResumeText(resume);
  const jobKeywords = [
    ...jobDescription.skills,
    ...jobDescription.requirements,
  ].map(k => k.toLowerCase());

  const matchedKeywords = findMatchingKeywords(resumeText, jobKeywords);
  const missingKeywords = jobKeywords.filter(k => !matchedKeywords.includes(k));

  const matchPercentage = Math.round(
    (matchedKeywords.length / jobKeywords.length) * 100
  );

  const score = calculateATSScore(resume, jobDescription);
  const improvements = generateImprovements(resume, jobDescription, missingKeywords);

  return {
    score,
    matchPercentage,
    keywordMatches: matchedKeywords,
    missingKeywords,
    improvements,
  };
}

function buildResumeText(resume: ResumeData): string {
  return [
    resume.contact.name,
    resume.contact.email,
    resume.contact.phone,
    resume.summary,
    resume.skills.join(" "),
    resume.experience.map(e => `${e.title} ${e.company} ${e.description.join(" ")}`).join(" "),
    resume.education.map(e => `${e.degree} ${e.field} ${e.institution}`).join(" "),
    resume.projects?.map(p => `${p.title} ${p.description} ${p.technologies.join(" ")}`).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function findMatchingKeywords(resumeText: string, jobKeywords: string[]): string[] {
  return jobKeywords.filter(keyword => {
    const keywordLower = keyword.toLowerCase();
    const variations = generateKeywordVariations(keywordLower);
    return variations.some(v => resumeText.includes(v));
  });
}

function generateKeywordVariations(keyword: string): string[] {
  const variations = [keyword];

  // Add common variations
  if (keyword.includes("+")) {
    variations.push(keyword.replace("+", " plus"));
    variations.push(keyword.replace(/\+/g, ""));
  }

  if (keyword.includes("#")) {
    variations.push(keyword.replace("#", "sharp"));
    variations.push(keyword.replace("#", ""));
  }

  if (keyword.includes(".")) {
    variations.push(keyword.replace(/\./g, ""));
  }

  if (keyword.includes("-")) {
    variations.push(keyword.replace("-", " "));
  }

  return [...new Set(variations)];
}

function calculateATSScore(resume: ResumeData, jobDescription: JobDescription): number {
  let score = 0;

  // Contact information (10 points)
  if (resume.contact.email) score += 3;
  if (resume.contact.phone) score += 3;
  if (resume.contact.name) score += 4;

  // Summary (5 points)
  if (resume.summary?.trim()) score += 5;

  // Skills section (15 points)
  if (resume.skills.length > 0) {
    score += Math.min(15, resume.skills.length * 2);
  }

  // Experience section (30 points)
  if (resume.experience.length > 0) {
    score += Math.min(30, resume.experience.length * 8);
  }

  // Education section (15 points)
  if (resume.education.length > 0) {
    score += Math.min(15, resume.education.length * 7);
  }

  // Keyword matching (25 points)
  const resumeText = buildResumeText(resume);
  const jobKeywords = [
    ...jobDescription.skills,
    ...jobDescription.requirements,
  ];
  const matchedCount = findMatchingKeywords(resumeText, jobKeywords).length;
  const keywordScore = Math.min(25, (matchedCount / Math.max(jobKeywords.length, 1)) * 25);
  score += keywordScore;

  // Format check (5 points - assume well formatted)
  score += 5;

  return Math.min(100, Math.round(score));
}

function generateImprovements(
  resume: ResumeData,
  jobDescription: JobDescription,
  missingKeywords: string[]
): string[] {
  const improvements: string[] = [];

  if (!resume.summary?.trim()) {
    improvements.push("Add a professional summary that highlights key skills");
  }

  if (resume.skills.length < 10) {
    improvements.push(`Add more skills (currently have ${resume.skills.length}, aim for 10+)`);
  }

  if (resume.experience.length === 0) {
    improvements.push("Add professional experience details");
  }

  if (resume.education.length === 0) {
    improvements.push("Add education information");
  }

  const resumeText = buildResumeText(resume);
  const criticalMissing = missingKeywords.slice(0, 5);
  if (criticalMissing.length > 0) {
    improvements.push(
      `Incorporate key skills: ${criticalMissing.join(", ")}`
    );
  }

  resume.experience.forEach(exp => {
    if (exp.description.length < 3) {
      improvements.push(
        `Add more bullet points to ${exp.title} role (currently ${exp.description.length})`
      );
    }
  });

  if (!resumeText.includes("achievements") && !resumeText.includes("accomplishments")) {
    improvements.push("Quantify achievements with metrics and results");
  }

  return improvements;
}

export function getATSFriendlyFormatting(): string[] {
  return [
    "Use standard fonts: Arial, Calibri, or Times New Roman",
    "Keep file format as .docx or .pdf",
    "Use clear section headers (EXPERIENCE, EDUCATION, SKILLS)",
    "Avoid tables, graphics, and special formatting",
    "Use bullet points for easy scanning",
    "Include relevant keywords from the job description",
    "Keep to 1-2 pages",
    "Use consistent date formatting",
    "Avoid headers, footers, and unusual spacing",
  ];
}
