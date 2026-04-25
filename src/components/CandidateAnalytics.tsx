import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { AnalysisResult, Candidate } from '../types';
import {
  TrendingUp, GitBranch, Star, GitFork, Calendar,
  Code2, Award, Target, Activity, Zap,
} from 'lucide-react';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#ef4444', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#a855f7',
];

interface Props {
  candidate: Candidate;
  result: AnalysisResult;
  jobRoleName: string;
}

const CandidateAnalytics: React.FC<Props> = ({ candidate, result, jobRoleName }) => {
  // ----- Pie chart data: languages -----
  const languageData = useMemo(() => {
    if (!result.languageStats) return [];
    return Object.entries(result.languageStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [result.languageStats]);

  // ----- Bar chart: monthly commits -----
  const monthlyData = useMemo(() => {
    return result.activity?.monthlyCommits || [];
  }, [result.activity]);

  // ----- Radar chart: score breakdown -----
  const radarData = [
    { metric: 'Skills', value: result.skill_match, fullMark: 100 },
    { metric: 'Activity', value: result.activity_score, fullMark: 100 },
    { metric: 'Repo Quality', value: result.repo_quality, fullMark: 100 },
    { metric: 'Open Source', value: result.open_source, fullMark: 100 },
    { metric: 'Consistency', value: result.consistency, fullMark: 100 },
  ];

  // ----- Top repos by stars (bar chart) -----
  const topReposByStars = useMemo(() => {
    if (!result.repositories) return [];
    return [...result.repositories]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map(r => ({
        name: r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name,
        fullName: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
      }));
  }, [result.repositories]);

  // ----- Skills coverage donut -----
  const matched = result.skillsMatched?.length || 0;
  const missing = result.skillsMissing?.length || 0;
  const skillsCoverage = [
    { name: 'Matched', value: matched, color: '#10b981' },
    { name: 'Missing', value: missing, color: '#ef4444' },
  ];

  // ----- Repo language distribution (count of repos per language, not bytes) -----
  const repoLanguageCount = useMemo(() => {
    if (!result.repositories) return [];
    const counts: Record<string, number> = {};
    result.repositories.forEach(r => {
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [result.repositories]);

  // ----- Activity trend (cumulative) -----
  const cumulativeActivity = useMemo(() => {
    let total = 0;
    return monthlyData.map(m => {
      total += m.commits;
      return { month: m.month, commits: m.commits, cumulative: total };
    });
  }, [monthlyData]);

  // ----- Stats cards -----
  const totalStars = result.repositories?.reduce((s, r) => s + r.stargazers_count, 0) || 0;
  const totalForks = result.repositories?.reduce((s, r) => s + r.forks_count, 0) || 0;
  const lastYearCommits = result.activity?.lastYearCommits || 0;
  const activeMonths = monthlyData.filter(m => m.commits > 0).length;
  const peakMonth = monthlyData.reduce((max, m) => (m.commits > max.commits ? m : max), { month: '-', commits: 0 });
  const avgCommits = result.activity?.avgCommitsPerMonth?.toFixed(1) || '0';

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(255,255,255,0.98)',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
  };

  return (
    <div className="space-y-6">
      {/* ============ Headline Stats ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Star className="w-5 h-5" />} label="Total Stars" value={totalStars} color="from-yellow-400 to-orange-500" />
        <StatCard icon={<GitFork className="w-5 h-5" />} label="Total Forks" value={totalForks} color="from-blue-400 to-indigo-500" />
        <StatCard icon={<GitBranch className="w-5 h-5" />} label="Repositories" value={candidate.public_repos || 0} color="from-purple-400 to-pink-500" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="Commits / Year" value={lastYearCommits} color="from-green-400 to-teal-500" />
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Active Months" value={`${activeMonths}/12`} color="from-pink-400 to-rose-500" />
        <StatCard icon={<Zap className="w-5 h-5" />} label="Peak Month" value={`${peakMonth.commits}`} sublabel={peakMonth.month} color="from-cyan-400 to-blue-500" />
      </div>

      {/* ============ Score Radar + Skills Donut ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Radar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Performance Breakdown
              </h3>
              <p className="text-sm text-gray-500">Multi-dimensional score across 5 key metrics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} strokeWidth={2} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Coverage Donut */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Skills Coverage
          </h3>
          <p className="text-sm text-gray-500 mb-2">For {jobRoleName || 'role'}</p>
          {matched + missing > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={skillsCoverage} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value">
                    {skillsCoverage.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-32 mb-24">
                <p className="text-3xl font-bold text-gray-800">
                  {matched + missing > 0 ? Math.round((matched / (matched + missing)) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Match Rate</p>
              </div>
              <div className="flex justify-around text-sm mt-2">
                <div className="text-center">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-gray-700">Matched: <strong>{matched}</strong></span>
                </div>
                <div className="text-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  <span className="text-gray-700">Missing: <strong>{missing}</strong></span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-12">Select a job role for skill matching</p>
          )}
        </div>
      </div>

      {/* ============ Monthly Commits Bar Chart ============ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Commit Activity
            </h3>
            <p className="text-sm text-gray-500">Commits made each month over the last 12 months</p>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Total: <strong className="text-gray-900">{lastYearCommits}</strong></span>
            <span className="text-gray-600">Avg: <strong className="text-gray-900">{avgCommits}/mo</strong></span>
          </div>
        </div>
        {monthlyData.length > 0 && monthlyData.some(m => m.commits > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
              <Bar dataKey="commits" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-16">No commit activity recorded in the last 12 months</p>
        )}
      </div>

      {/* ============ Cumulative Activity Trend ============ */}
      {cumulativeActivity.length > 0 && cumulativeActivity[cumulativeActivity.length - 1].cumulative > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Contribution Growth Trend
          </h3>
          <p className="text-sm text-gray-500 mb-4">Cumulative commits over the last year — steeper slope = more active</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cumulativeActivity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="cumulative" stroke="#14b8a6" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ============ Languages Pie + Repo Language Count ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart - Languages by code volume */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600" />
            Languages by Code Volume
          </h3>
          <p className="text-sm text-gray-500 mb-4">% of total bytes written across top repos</p>
          {languageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={languageData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                  {languageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-16">No language data available</p>
          )}
        </div>

        {/* Repo count per language */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            Repositories per Language
          </h3>
          <p className="text-sm text-gray-500 mb-4">How many repos use each primary language</p>
          {repoLanguageCount.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={repoLanguageCount} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#374151', fontSize: 12 }} width={90} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {repoLanguageCount.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-16">No repo languages found</p>
          )}
        </div>
      </div>

      {/* ============ Top Repositories by Stars ============ */}
      {topReposByStars.length > 0 && topReposByStars[0].stars > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Top Repositories — Stars vs Forks
          </h3>
          <p className="text-sm text-gray-500 mb-4">Compare community traction across the most popular repos</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topReposByStars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip {...tooltipStyle}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label} />
              <Legend />
              <Bar dataKey="stars" fill="#f59e0b" radius={[6, 6, 0, 0]} name="⭐ Stars" />
              <Bar dataKey="forks" fill="#3b82f6" radius={[6, 6, 0, 0]} name="🍴 Forks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ============ Skills Match (chips) ============ */}
      {(matched + missing) > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Skills Analysis for {jobRoleName || 'Selected Role'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Based on repo languages, topics, and tech detected</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-green-700 mb-3">✓ Matched ({matched})</h4>
              <div className="flex flex-wrap gap-2">
                {result.skillsMatched && result.skillsMatched.length > 0
                  ? result.skillsMatched.map((s) => (
                    <span key={s} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                      {s}
                    </span>
                  ))
                  : <p className="text-gray-400 text-sm">None matched</p>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-700 mb-3">✗ Missing ({missing})</h4>
              <div className="flex flex-wrap gap-2">
                {result.skillsMissing && result.skillsMissing.length > 0
                  ? result.skillsMissing.map((s) => (
                    <span key={s} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium">
                      {s}
                    </span>
                  ))
                  : <p className="text-gray-400 text-sm">All skills matched! 🎉</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Top Repos List ============ */}
      {result.repositories && result.repositories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Featured Repositories
          </h3>
          <div className="space-y-3">
            {[...result.repositories].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5).map((repo) => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-blue-600 group-hover:underline truncate">{repo.name}</h4>
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">{repo.description || 'No description provided'}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap items-center">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLangColor(repo.language) }}></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">⭐ {repo.stargazers_count}</span>
                      <span className="flex items-center gap-1">🍴 {repo.forks_count}</span>
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repo.topics.slice(0, 5).map(t => (
                          <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sublabel?: string;
  color: string;
}> = ({ icon, label, value, sublabel, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center mb-2`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
    {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
  </div>
);

// Common GitHub language colors
function getLangColor(lang: string): string {
  const map: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
    Go: '#00ADD8', Rust: '#dea584', PHP: '#4F5D95', Ruby: '#701516',
    Swift: '#FA7343', Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c',
    Vue: '#41b883', Shell: '#89e051', Dart: '#00B4AB', Scala: '#c22d40',
    R: '#198CE7', Lua: '#000080', Perl: '#0298c3', Haskell: '#5e5086',
  };
  return map[lang] || '#8b5cf6';
}

export default CandidateAnalytics;
