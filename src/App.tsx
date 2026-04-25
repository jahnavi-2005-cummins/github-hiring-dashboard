import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Search, FileText, Settings, LogOut,
  GitCompare, User, Menu, X, Award, AlertCircle,
  CheckCircle, XCircle, HelpCircle, Activity, Plus, Edit2, Trash2, Save
} from 'lucide-react';
import type { User as UserType, Candidate, AnalysisResult, DashboardStats } from './types';
import { analyzeGitHubProfile } from './services/githubService';
import { ToastContainer, type ToastMessage, type ToastType } from './components/Toast';
import CandidateAnalytics from './components/CandidateAnalytics';

// ----------------------------- Types ---------------------------------
interface JobRole {
  id: number;
  name: string;
  skills: string[];
}

const DEFAULT_ROLES: JobRole[] = [
  { id: 1, name: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML'] },
  { id: 2, name: 'Backend Developer', skills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'Java'] },
  { id: 3, name: 'Full Stack Developer', skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'] },
  { id: 4, name: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'] },
  { id: 5, name: 'Mobile Developer', skills: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'Dart'] },
];

const initialDashboardStats: DashboardStats = {
  totalCandidates: 0,
  selectedCount: 0,
  rejectedCount: 0,
  considerCount: 0,
  mostSearchedRoles: [],
  mostCommonSkills: [],
  recentSearches: [],
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload as T;
}

// ------------------------- Login ---------------------------------
const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const auth = await apiRequest<{
        token: string;
        userId?: number;
        id?: number;
        name: string;
        email: string;
        role: string;
      }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      const userId = auth.userId ?? auth.id;
      const loggedInUser: UserType = {
        id: userId ?? 0,
        name: auth.name,
        email: auth.email,
        role: auth.role.toLowerCase() === 'admin' ? 'admin' : 'hr',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      onLogin();
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">GitHub Dashboard Analyzer</h1>
          <p className="text-gray-500 mt-2">Smart Hiring Assistant for HR Teams</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="hr@company.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••" required />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}
          <button type="submit" disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">Use your pre-approved HR credentials</div>
      </div>
    </div>
  );
};

// ------------------------- Sidebar ---------------------------------
const Sidebar: React.FC<{
  isOpen: boolean; onClose: () => void; currentPage: string;
  onNavigate: (page: string) => void; onLogout: () => void;
}> = ({ isOpen, onClose, currentPage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search Candidates', icon: Search },
    { id: 'candidates', label: 'All Candidates', icon: Users },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'roles', label: 'Job Roles', icon: FileText },
    { id: 'admin', label: 'Admin Panel', icon: Settings },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">GitHub Analyzer</h2>
                <p className="text-xs text-gray-500">HR Dashboard</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === item.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// ------------------------- Dashboard ---------------------------------
const DashboardPage: React.FC<{ stats: DashboardStats; onNavigate: (p: string) => void }> = ({ stats, onNavigate }) => {
  const hasData = stats.totalCandidates > 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of your hiring analytics</p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Candidates Yet</h3>
          <p className="text-gray-500 mb-6">Start by searching for GitHub profiles to analyze candidates</p>
          <button onClick={() => onNavigate('search')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition">
            <Search className="w-5 h-5" />Search Candidates
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Candidates', value: stats.totalCandidates, color: 'text-gray-800', bg: 'bg-blue-100', icon: Users, iconColor: 'text-blue-600' },
              { label: 'Selected', value: stats.selectedCount, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, iconColor: 'text-green-600' },
              { label: 'Consider', value: stats.considerCount, color: 'text-yellow-600', bg: 'bg-yellow-100', icon: HelpCircle, iconColor: 'text-yellow-600' },
              { label: 'Rejected', value: stats.rejectedCount, color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, iconColor: 'text-red-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selection Ratio</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="3"
                      strokeDasharray={`${(stats.selectedCount / stats.totalCandidates) * 100}, 100`} />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eab308" strokeWidth="3"
                      strokeDasharray={`${(stats.considerCount / stats.totalCandidates) * 100}, 100`}
                      strokeDashoffset={`-${(stats.selectedCount / stats.totalCandidates) * 100}`} />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3"
                      strokeDasharray={`${(stats.rejectedCount / stats.totalCandidates) * 100}, 100`}
                      strokeDashoffset={`-${((stats.selectedCount + stats.considerCount) / stats.totalCandidates) * 100}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{stats.totalCandidates}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4 flex-wrap">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /><span className="text-sm text-gray-600">Selected ({Math.round((stats.selectedCount / stats.totalCandidates) * 100)}%)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /><span className="text-sm text-gray-600">Consider ({Math.round((stats.considerCount / stats.totalCandidates) * 100)}%)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-sm text-gray-600">Rejected ({Math.round((stats.rejectedCount / stats.totalCandidates) * 100)}%)</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Searched Roles</h3>
              {stats.mostSearchedRoles.length > 0 ? (
                <div className="space-y-4">
                  {stats.mostSearchedRoles.map((role, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{role.role_name}</span>
                        <span className="font-medium text-gray-800">{role.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          style={{ width: `${(role.count / Math.max(...stats.mostSearchedRoles.map(r => r.count))) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-8">No role data yet</p>}
            </div>
          </div>

          {stats.mostCommonSkills.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Common Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.mostCommonSkills.map((skill, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">{skill.count}</p>
                    <p className="text-sm text-gray-500">{skill.skill_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ------------------------- Search Page ---------------------------------
const SearchPage: React.FC<{
  jobRoles: JobRole[];
  onAnalyze: (candidate: Candidate, result: AnalysisResult) => void;
  onDecision: (githubUsername: string, decision: 'selected' | 'consider' | 'rejected') => void;
  toast: (type: ToastType, message: string) => void;
}> = ({ jobRoles, onAnalyze, onDecision, toast }) => {
  const [username, setUsername] = useState('');
  const [jobRoleName, setJobRoleName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState('');
  const [currentDecision, setCurrentDecision] = useState<'selected' | 'consider' | 'rejected' | null>(null);

  const handleAnalyze = async () => {
    if (!username) return;
    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setCandidate(null);
    setCurrentDecision(null);

    try {
      const selectedRole = jobRoles.find(r => r.name === jobRoleName);
      const data = await analyzeGitHubProfile(
        username,
        jobRoleName || 'Full Stack Developer',
        selectedRole?.skills
      );

      const newCandidate: Candidate = {
        id: Date.now(),
        github_username: data.profile.login,
        name: data.profile.name || data.profile.login,
        profile_url: data.profile.html_url,
        last_analyzed: new Date().toISOString(),
        avatar_url: data.profile.avatar_url,
        public_repos: data.profile.public_repos,
        followers: data.profile.followers,
      };

      const newResult: AnalysisResult = {
        id: Date.now(),
        candidate_id: newCandidate.id,
        score: data.scores.overall_score,
        skill_match: data.scores.skill_match,
        activity_score: data.scores.activity_score,
        repo_quality: data.scores.repo_quality,
        open_source: data.scores.open_source,
        consistency: data.scores.consistency,
        strengths: data.evaluation.strengths,
        weaknesses: data.evaluation.weaknesses,
        decision: 'consider', // HR will decide
        analyzed_at: new Date().toISOString(),
        repositories: data.topRepositories.map((r) => ({
          id: r.id, name: r.name, full_name: r.full_name, description: r.description,
          html_url: r.html_url, language: r.language, stargazers_count: r.stargazers_count,
          forks_count: r.forks_count, updated_at: r.updated_at, topics: r.topics || [],
        })),
        languageStats: data.languagePercentages,
        activity: {
          lastYearCommits: data.activity.lastYearCommits,
          monthlyCommits: data.activity.monthlyCommits,
          avgCommitsPerMonth: data.activity.avgCommitsPerMonth,
        },
        totalCommits: data.activity.totalCommits,
        skillsMatched: data.skills.matched,
        skillsMissing: data.skills.missing,
      };

      setCandidate(newCandidate);
      setResult(newResult);
      onAnalyze(newCandidate, newResult);
      toast('success', `Successfully analyzed @${data.profile.login}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch GitHub profile. Please check the username.';
      setError(msg);
      toast('error', msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDecision = (decision: 'selected' | 'consider' | 'rejected') => {
    if (!candidate || !result) return;
    setCurrentDecision(decision);
    onDecision(candidate.github_username, decision);
    const messages = {
      selected: `✓ @${candidate.github_username} marked as SELECTED`,
      consider: `⚡ @${candidate.github_username} marked for CONSIDERATION`,
      rejected: `✗ @${candidate.github_username} marked as REJECTED`,
    };
    const types: Record<string, ToastType> = { selected: 'success', consider: 'warning', rejected: 'error' };
    toast(types[decision], messages[decision]);
  };

  const getScoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Search Candidates</h1>
        <p className="text-gray-500">Analyze GitHub profiles for hiring decisions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., torvalds" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
            <select value={jobRoleName} onChange={(e) => setJobRoleName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select a role</option>
              {jobRoles.map((role) => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleAnalyze} disabled={isAnalyzing || !username}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {isAnalyzing ? (<><Activity className="w-5 h-5 animate-spin" />Analyzing...</>) : (<><Search className="w-5 h-5" />Analyze Profile</>)}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />{error}
        </div>
      )}

      {result && candidate && (
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              <img src={candidate.avatar_url} alt={candidate.name} className="w-20 h-20 rounded-full"
                onError={(e) => (e.currentTarget.src = 'https://avatars.githubusercontent.com/u/1?v=4')} />
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{candidate.name}</h2>
                    <a href={candidate.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      @{candidate.github_username}
                    </a>
                  </div>
                  {currentDecision && (
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      currentDecision === 'selected' ? 'bg-green-100 text-green-700' :
                      currentDecision === 'consider' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{currentDecision.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>{candidate.public_repos} repositories</span>
                  <span>{candidate.followers} followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Score</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none"
                    stroke={result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#eab308' : '#ef4444'}
                    strokeWidth="3" strokeDasharray={`${result.score}, 100`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 min-w-[280px]">
                {[
                  { label: 'Skills Match', value: result.skill_match },
                  { label: 'Activity', value: result.activity_score },
                  { label: 'Repo Quality', value: result.repo_quality },
                  { label: 'Open Source', value: result.open_source },
                  { label: 'Consistency', value: result.consistency },
                ].map((m, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className={`text-xl font-bold ${getScoreColor(m.value)}`}>{m.value}%</p>
                    <p className="text-xs text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" />Strengths</h3>
              <ul className="space-y-2">
                {(Array.isArray(result.strengths) ? result.strengths : [result.strengths]).map((s, i) => (
                  <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Weaknesses</h3>
              <ul className="space-y-2">
                {(Array.isArray(result.weaknesses) ? result.weaknesses : [result.weaknesses]).map((w, i) => (
                  <li key={i} className="text-gray-700 text-sm flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span><span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============ DEEP ANALYTICS DASHBOARD ============ */}
          <CandidateAnalytics candidate={candidate} result={result} jobRoleName={jobRoleName} />

          {/* HR Decision Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">HR Decision</h3>
            <p className="text-sm text-gray-500 mb-4">Review the analysis above and make your hiring decision</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => handleDecision('selected')}
                className={`py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  currentDecision === 'selected' ? 'bg-green-700 text-white ring-4 ring-green-200' : 'bg-green-600 text-white hover:bg-green-700'
                }`}>
                <CheckCircle className="w-5 h-5" />Select Candidate
              </button>
              <button onClick={() => handleDecision('consider')}
                className={`py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  currentDecision === 'consider' ? 'bg-yellow-700 text-white ring-4 ring-yellow-200' : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}>
                <HelpCircle className="w-5 h-5" />Mark for Consideration
              </button>
              <button onClick={() => handleDecision('rejected')}
                className={`py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  currentDecision === 'rejected' ? 'bg-red-700 text-white ring-4 ring-red-200' : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                <XCircle className="w-5 h-5" />Reject Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------------- Candidates Page ---------------------------------
const CandidatesPage: React.FC<{
  candidates: (Candidate & { analysis: AnalysisResult })[];
  onDecision: (githubUsername: string, d: 'selected' | 'consider' | 'rejected') => void;
  toast: (t: ToastType, m: string) => void;
}> = ({ candidates, onDecision, toast }) => {
  const [filter, setFilter] = useState<'all' | 'selected' | 'consider' | 'rejected'>('all');
  const filtered = candidates.filter(c => filter === 'all' || c.analysis.decision === filter);

  const scoreColor = (s: number) => s >= 80 ? 'bg-green-100 text-green-700' : s >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  const decisionBadge = (d: string) => ({
    selected: 'bg-green-100 text-green-700',
    consider: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }[d] || 'bg-gray-100 text-gray-700');

  const handleQuickDecision = (c: Candidate & { analysis: AnalysisResult }, d: 'selected' | 'consider' | 'rejected') => {
    onDecision(c.github_username, d);
    toast(d === 'selected' ? 'success' : d === 'rejected' ? 'error' : 'warning',
      `@${c.github_username} marked as ${d.toUpperCase()}`);
  };

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Candidates</h1>
          <p className="text-gray-500">Manage and review analyzed candidates</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Candidates</h3>
          <p className="text-gray-500">Search for GitHub profiles to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">All Candidates</h1>
        <p className="text-gray-500">Manage and review analyzed candidates</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['all', 'selected', 'consider', 'rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === f ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Candidate</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Decision</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Analyzed</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar_url} alt={c.name} className="w-10 h-10 rounded-full"
                      onError={(e) => (e.currentTarget.src = 'https://avatars.githubusercontent.com/u/1?v=4')} />
                    <div>
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <a href={c.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        @{c.github_username}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${scoreColor(c.analysis.score)}`}>{c.analysis.score}/100</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${decisionBadge(c.analysis.decision)}`}>{c.analysis.decision.toUpperCase()}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.analysis.analyzed_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button onClick={() => handleQuickDecision(c, 'selected')} title="Select"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleQuickDecision(c, 'consider')} title="Consider"
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"><HelpCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleQuickDecision(c, 'rejected')} title="Reject"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><XCircle className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ------------------------- Compare Page ---------------------------------
const ComparePage: React.FC<{ jobRoles: JobRole[]; toast: (t: ToastType, m: string) => void }> = ({ jobRoles, toast }) => {
  const [u1, setU1] = useState('');
  const [u2, setU2] = useState('');
  const [roleName, setRoleName] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!u1 || !u2) return;
    setIsComparing(true);
    setError('');
    setComparison(null);
    try {
      const role = jobRoles.find(r => r.name === roleName);
      const skills = role?.skills;
      const [d1, d2] = await Promise.all([
        analyzeGitHubProfile(u1, roleName || 'Full Stack Developer', skills),
        analyzeGitHubProfile(u2, roleName || 'Full Stack Developer', skills),
      ]);
      const winner = d2.scores.overall_score > d1.scores.overall_score ? 2 : 1;
      const winnerName = winner === 1 ? d1.profile.login : d2.profile.login;
      setComparison({
        c1: { profile: d1.profile, score: d1.scores.overall_score, skills: d1.skills.matched, activity: d1.scores.activity_score, repos: d1.profile.public_repos, followers: d1.profile.followers },
        c2: { profile: d2.profile, score: d2.scores.overall_score, skills: d2.skills.matched, activity: d2.scores.activity_score, repos: d2.profile.public_repos, followers: d2.profile.followers },
        winner,
        recommendation: `@${winnerName} shows better overall performance with a higher score and stronger skill match.`,
      });
      toast('success', `Comparison complete - @${winnerName} recommended`);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
      toast('error', err.message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Compare Candidates</h1>
        <p className="text-gray-500">Side-by-side comparison of real GitHub profiles</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate 1</label>
            <input type="text" value={u1} onChange={(e) => setU1(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="GitHub username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate 2</label>
            <input type="text" value={u2} onChange={(e) => setU2(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="GitHub username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Role (optional)</label>
            <select value={roleName} onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Any</option>
              {jobRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleCompare} disabled={isComparing || !u1 || !u2}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {isComparing ? (<><Activity className="w-5 h-5 animate-spin" />Fetching real GitHub data...</>) : 'Compare Profiles'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />{error}
        </div>
      )}

      {comparison && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[comparison.c1, comparison.c2].map((c: any, i: number) => (
              <div key={i} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${comparison.winner === i + 1 ? 'border-green-500' : 'border-gray-100'}`}>
                {comparison.winner === i + 1 && (
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <Award className="w-5 h-5" /><span className="font-semibold">Recommended</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <img src={c.profile.avatar_url} className="w-12 h-12 rounded-full" alt={c.profile.login} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{c.profile.name || c.profile.login}</h3>
                    <a href={c.profile.html_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">@{c.profile.login}</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <p className={`text-3xl font-bold ${c.score >= 80 ? 'text-green-600' : c.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{c.score}/100</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Repos</p><p className="font-bold">{c.repos}</p></div>
                    <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Followers</p><p className="font-bold">{c.followers}</p></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Matched Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {c.skills.length > 0 ? c.skills.slice(0, 6).map((s: string, j: number) => (
                        <span key={j} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{s}</span>
                      )) : <p className="text-xs text-gray-400">No matched skills</p>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Activity Score</p>
                    <div className="h-2 bg-gray-100 rounded-full mt-1">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${c.activity}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{c.activity}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommendation</h3>
            <p className="text-gray-600">{comparison.recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
};

// ------------------------- Job Roles Page (EDITABLE) ---------------------------------
const RolesPage: React.FC<{
  jobRoles: JobRole[];
  setJobRoles: React.Dispatch<React.SetStateAction<JobRole[]>>;
  toast: (t: ToastType, m: string) => void;
}> = ({ jobRoles, setJobRoles, toast }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSkills, setNewSkills] = useState('');

  const startEdit = (role: JobRole) => {
    setEditingId(role.id);
    setEditName(role.name);
    setEditSkills(role.skills.join(', '));
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      toast('error', 'Role name cannot be empty');
      return;
    }
    const skills = editSkills.split(',').map(s => s.trim()).filter(Boolean);
    setJobRoles(prev => prev.map(r => r.id === editingId ? { ...r, name: editName.trim(), skills } : r));
    toast('success', `Role "${editName}" updated`);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSkills('');
  };

  const deleteRole = (id: number, name: string) => {
    if (!confirm(`Delete role "${name}"?`)) return;
    setJobRoles(prev => prev.filter(r => r.id !== id));
    toast('success', `Role "${name}" deleted`);
  };

  const addRole = () => {
    if (!newName.trim()) {
      toast('error', 'Role name is required');
      return;
    }
    const skills = newSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newRole: JobRole = { id: Date.now(), name: newName.trim(), skills };
    setJobRoles(prev => [...prev, newRole]);
    toast('success', `Role "${newName}" created`);
    setIsAdding(false);
    setNewName('');
    setNewSkills('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Roles</h1>
          <p className="text-gray-500">Manage job roles and their required skills</p>
        </div>
        <button onClick={() => setIsAdding(true)} disabled={isAdding}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50 flex items-center gap-2">
          <Plus className="w-5 h-5" />Add New Role
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Job Role</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Data Scientist" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
              <input type="text" value={newSkills} onChange={(e) => setNewSkills(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Python, TensorFlow, SQL, Pandas" />
            </div>
            <div className="flex gap-2">
              <button onClick={addRole} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                <Save className="w-4 h-4" />Create
              </button>
              <button onClick={() => { setIsAdding(false); setNewName(''); setNewSkills(''); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {editingId === role.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input type="text" value={editSkills} onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />Save
                  </button>
                  <button onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{role.skills.length} skills</span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {role.skills.length > 0 ? role.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{s}</span>
                    )) : <p className="text-sm text-gray-400">No skills defined</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(role)}
                    className="flex-1 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />Edit
                  </button>
                  <button onClick={() => deleteRole(role.id, role.name)}
                    className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {jobRoles.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Job Roles</h3>
          <p className="text-gray-500 mb-4">Create your first job role to get started</p>
        </div>
      )}
    </div>
  );
};

// ------------------------- Admin Page ---------------------------------
const AdminPage: React.FC<{ stats: DashboardStats; jobRoles: JobRole[] }> = ({ stats, jobRoles }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-500">System settings and overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total Searches</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalCandidates}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Active Job Roles</p>
          <p className="text-3xl font-bold text-blue-600">{jobRoles.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Selection Rate</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalCandidates > 0 ? Math.round((stats.selectedCount / stats.totalCandidates) * 100) : 0}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Current User</p>
                <p className="text-sm text-gray-500">HR User</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Active</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Data source:</span><span className="font-medium">GitHub Public API</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Backend:</span><span className="font-medium">Spring Boot APIs</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Storage:</span><span className="font-medium">MySQL + local UI state</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------- App Component ---------------------------------
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<DashboardStats>(initialDashboardStats);
  const [candidates, setCandidates] = useState<(Candidate & { analysis: AnalysisResult })[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(DEFAULT_ROLES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const mapApiCandidate = useCallback((item: any) => {
    const candidate: Candidate = {
      id: item.id,
      github_username: item.githubUsername,
      name: item.name,
      profile_url: item.profileUrl,
      last_analyzed: item.lastAnalyzed || new Date().toISOString(),
      avatar_url: item.avatarUrl,
      public_repos: item.publicRepos,
      followers: item.followers,
      following: item.following,
    };

    const analysis: AnalysisResult = {
      id: item.analysisId ?? Date.now(),
      candidate_id: item.id,
      score: item.score || 0,
      skill_match: Math.round(item.skillMatch || 0),
      activity_score: Math.round(item.activityScore || 0),
      repo_quality: Math.round(item.repoQuality || 0),
      open_source: Math.round(item.openSource || 0),
      consistency: Math.round(item.consistency || 0),
      strengths: Array.isArray(item.strengths) ? item.strengths : [],
      weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses : [],
      decision: (item.decision || 'consider') as 'selected' | 'consider' | 'rejected',
      analyzed_at: item.analyzedAt || item.lastAnalyzed || new Date().toISOString(),
    };

    return { ...candidate, analysis };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsData, candidateData] = await Promise.all([
        apiRequest<any>('/api/stats/dashboard'),
        apiRequest<any[]>('/api/candidates'),
      ]);
      setStats(prev => ({
        ...prev,
        totalCandidates: Number(statsData.totalCandidates || 0),
        selectedCount: Number(statsData.selectedCount || 0),
        considerCount: Number(statsData.considerCount || 0),
        rejectedCount: Number(statsData.rejectedCount || 0),
      }));
      setCandidates(candidateData.map(mapApiCandidate));
    } catch {
      // Keep app usable even if backend is temporarily unavailable.
    }
  }, [mapApiCandidate]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      void fetchDashboardData();
    }
    const savedRoles = localStorage.getItem('jobRoles');
    if (savedRoles) {
      try { setJobRoles(JSON.parse(savedRoles)); } catch {}
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    localStorage.setItem('jobRoles', JSON.stringify(jobRoles));
  }, [jobRoles]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const closeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    void fetchDashboardData();
    showToast('success', 'Welcome back!');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const handleAnalyze = (candidate: Candidate, result: AnalysisResult) => {
    const newCandidate = { ...candidate, analysis: result };
    setCandidates(prev => {
      const existing = prev.find(c => c.github_username === candidate.github_username);
      if (existing) {
        return prev.map(c => c.github_username === candidate.github_username ? newCandidate : c);
      }
      return [newCandidate, ...prev];
    });
    setStats(prev => {
      const isNew = !candidates.find(c => c.github_username === candidate.github_username);
      return isNew ? {
        ...prev,
        totalCandidates: prev.totalCandidates + 1,
        considerCount: prev.considerCount + 1, // default decision is consider until HR decides
      } : prev;
    });

    void (async () => {
      try {
        const saved = await apiRequest<any>('/api/candidates/save-analysis', {
          method: 'POST',
          body: JSON.stringify({
            githubUsername: candidate.github_username,
            name: candidate.name,
            avatarUrl: candidate.avatar_url,
            profileUrl: candidate.profile_url,
            publicRepos: candidate.public_repos,
            followers: candidate.followers,
            following: candidate.following,
            score: result.score,
            skillMatch: result.skill_match,
            activityScore: result.activity_score,
            repoQuality: result.repo_quality,
            openSource: result.open_source,
            consistency: result.consistency,
            strengths: Array.isArray(result.strengths) ? result.strengths : [result.strengths],
            weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [result.weaknesses],
            decision: result.decision,
            roleName: null,
            hrId: user?.id || null,
          }),
        });

        setCandidates(prev => prev.map(c =>
          c.github_username === candidate.github_username
            ? {
                ...c,
                id: saved.id || c.id,
                analysis: {
                  ...c.analysis,
                  id: saved.analysisId || c.analysis.id,
                  candidate_id: saved.id || c.analysis.candidate_id,
                },
              }
            : c
        ));
        void fetchDashboardData();
      } catch (err: any) {
        showToast('warning', `Saved locally only: ${err?.message || 'backend save failed'}`);
      }
    })();
  };

  const handleDecision = (githubUsername: string, decision: 'selected' | 'consider' | 'rejected') => {
    const ghKey = githubUsername.trim().toLowerCase();
    const target = candidates.find(c => c.github_username.toLowerCase() === ghKey);
    setCandidates(prev => {
      const row = prev.find(c => c.github_username.toLowerCase() === ghKey);
      if (!row) return prev;
      const oldDecision = row.analysis.decision;
      if (oldDecision === decision) return prev;

      setStats(s => {
        const next = { ...s };
        if (oldDecision === 'selected') next.selectedCount = Math.max(0, next.selectedCount - 1);
        else if (oldDecision === 'consider') next.considerCount = Math.max(0, next.considerCount - 1);
        else if (oldDecision === 'rejected') next.rejectedCount = Math.max(0, next.rejectedCount - 1);
        if (decision === 'selected') next.selectedCount += 1;
        else if (decision === 'consider') next.considerCount += 1;
        else if (decision === 'rejected') next.rejectedCount += 1;
        return next;
      });

      return prev.map(c =>
        c.github_username.toLowerCase() === ghKey
          ? { ...c, analysis: { ...c.analysis, decision } }
          : c
      );
    });

    const usernameForApi = target?.github_username ?? githubUsername.trim();
    void apiRequest('/api/candidates/decision', {
      method: 'POST',
      body: JSON.stringify({
        githubUsername: usernameForApi,
        decision,
        hrId: user?.id ?? null,
      }),
    })
      .then(() => {
        void fetchDashboardData();
      })
      .catch((err: any) => {
        showToast('warning', `Decision updated locally only: ${err?.message || 'backend update failed'}`);
      });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage stats={stats} onNavigate={setCurrentPage} />;
      case 'search': return <SearchPage jobRoles={jobRoles} onAnalyze={handleAnalyze} onDecision={handleDecision} toast={showToast} />;
      case 'candidates': return <CandidatesPage candidates={candidates} onDecision={handleDecision} toast={showToast} />;
      case 'compare': return <ComparePage jobRoles={jobRoles} toast={showToast} />;
      case 'roles': return <RolesPage jobRoles={jobRoles} setJobRoles={setJobRoles} toast={showToast} />;
      case 'admin': return <AdminPage stats={stats} jobRoles={jobRoles} />;
      default: return <DashboardPage stats={stats} onNavigate={setCurrentPage} />;
    }
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
        currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default App;
