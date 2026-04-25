// Type definitions for GitHub Dashboard Analyzer

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'hr';
  created_at: string;
}

export interface Candidate {
  id: number;
  github_username: string;
  name: string;
  profile_url: string;
  last_analyzed: string;
  avatar_url?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
}

export interface AnalysisResult {
  id: number;
  candidate_id: number;
  score: number;
  skill_match: number;
  activity_score: number;
  repo_quality: number;
  open_source: number;
  consistency: number;
  strengths: string | string[];
  weaknesses: string | string[];
  decision: 'selected' | 'consider' | 'rejected';
  analyzed_at: string;
  skills?: SkillMatch[];
  languages?: LanguageDistribution[];
  languageStats?: Record<string, number>;
  repositories?: Repository[];
  activity?: {
    lastYearCommits: number;
    monthlyCommits: { month: string; commits: number }[];
    avgCommitsPerMonth?: number;
  };
  totalCommits?: number;
  skillsMatched?: string[];
  skillsMissing?: string[];
}

export interface SkillMatch {
  skill_name: string;
  matched: boolean;
  weight: number;
  type: 'core' | 'secondary' | 'bonus';
}

export interface LanguageDistribution {
  name: string;
  percentage: number;
  color: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name?: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  topics: string[];
}

export interface JobRole {
  id: number;
  role_name: string;
  skills: RoleSkill[];
}

export interface RoleSkill {
  skill_id: number;
  skill_name: string;
  weight: number;
  type: 'core' | 'secondary' | 'bonus';
}

export interface Skill {
  id: number;
  skill_name: string;
  aliases: string[];
}

export interface SearchHistory {
  id: number;
  hr_id: number;
  candidate_id: number;
  candidate_username: string;
  searched_at: string;
  previous_score: number;
  updated_score: number;
}



export interface DashboardStats {
  totalCandidates: number;
  selectedCount: number;
  rejectedCount: number;
  considerCount: number;
  mostSearchedRoles: { role_name: string; count: number }[];
  mostCommonSkills: { skill_name: string; count: number }[];
  recentSearches: SearchHistory[];
}

export interface ContributionData {
  date: string;
  count: number;
}

export interface WeightConfig {
  skillsMatch: number;
  activityScore: number;
  repoQuality: number;
  openSource: number;
  consistency: number;
}

export interface ComparisonResult {
  candidate1: Candidate & { analysis: AnalysisResult };
  candidate2: Candidate & { analysis: AnalysisResult };
  recommendation: string;
  winner: number;
}
