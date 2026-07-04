export interface User {
  id: string;
  name: string;
  email: string;
  targetRole?: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileContent: string; // Plain text parsed
  atsScore: number;
  grammarFeedback: string[];
  formattingSuggestions: string[];
  missingSections: string[];
  rewriteSuggestions: string[];
  uploadedAt: string;
}

export interface SkillAnalysis {
  id: string;
  userId: string;
  targetRole: string;
  missingSkills: string[];
  learningRoadmap: {
    week: string;
    topic: string;
    description: string;
    resources: string[];
  }[];
  suggestedProjects: {
    title: string;
    description: string;
    techStack: string[];
  }[];
  estimatedReadinessScore: number;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: 'technical' | 'hr' | 'behavioral';
}

export interface InterviewAnswer {
  questionId: string;
  questionText: string;
  userResponse: string;
  score: number; // 0 to 100
  feedback: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  completed: boolean;
  finalScore?: number;
  createdAt: string;
}

export interface CodingSession {
  id: string;
  userId: string;
  problemTitle: string;
  problemDescription: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  userCode: string;
  language: string;
  logicFeedback: string;
  optimizations: string;
  complexityAnalysis: string; // e.g. "Time: O(N), Space: O(1)"
  codeQualityRating: number; // 1 to 5 stars
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  type: 'resume' | 'skill_gap' | 'interview' | 'coding';
  title: string;
  description: string;
  date: string;
}

export interface DashboardStats {
  resumeScore: number;
  interviewScore: number;
  codingScore: number;
  skillMatchPercentage: number;
  overallPlacementReadiness: number;
  recentActivities: RecentActivity[];
  weeklyImprovement: { week: string; score: number }[];
  recommendations: string[];
}
