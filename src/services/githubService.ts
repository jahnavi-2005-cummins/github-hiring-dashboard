// Real GitHub API service - fetches actual data from GitHub's public API
// No backend needed - all data is real and live

const GITHUB_API = 'https://api.github.com';

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
  company: string | null;
  blog: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics: string[];
  default_branch: string;
}

export interface AnalysisData {
  profile: GitHubProfile;
  repositories: GitHubRepo[];
  topRepositories: GitHubRepo[];
  languages: Record<string, number>;
  languagePercentages: Record<string, number>;
  scores: {
    overall_score: number;
    skill_match: number;
    activity_score: number;
    repo_quality: number;
    open_source: number;
    consistency: number;
  };
  evaluation: {
    strengths: string[];
    weaknesses: string[];
    decision: 'selected' | 'consider' | 'rejected';
  };
  activity: {
    lastYearCommits: number;
    monthlyCommits: { month: string; commits: number }[];
    avgCommitsPerMonth: number;
    totalCommits: number;
    activeRepos: number;
    recentlyActiveRepos: number;
  };
  skills: {
    matched: string[];
    missing: string[];
    matchPercentage: number;
  };
}

// Job role skill requirements
const ROLE_SKILLS: Record<string, string[]> = {
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'Vue', 'HTML', 'CSS', 'SCSS', 'Tailwind', 'Next.js'],
  'Backend Developer': ['Java', 'Python', 'Node.js', 'Go', 'C#', 'Ruby', 'PHP', 'Spring', 'Django', 'Express'],
  'Full Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'MongoDB', 'PostgreSQL', 'HTML', 'CSS'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Shell', 'Python', 'Go', 'Terraform', 'Ansible', 'YAML'],
  'Mobile Developer': ['Swift', 'Kotlin', 'Java', 'Dart', 'JavaScript', 'TypeScript', 'Objective-C'],
  'Data Scientist': ['Python', 'R', 'Jupyter Notebook', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'],
};

// Skill aliases - maps GitHub language names to skill names
const SKILL_ALIASES: Record<string, string> = {
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'jupyter notebook': 'Jupyter Notebook',
  'shellscript': 'Shell',
  'bash': 'Shell',
  'objective-c': 'Objective-C',
  'objc': 'Objective-C',
};

function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase();
  return SKILL_ALIASES[lower] || skill;
}

async function githubFetch(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 404) {
    throw new Error('GitHub user not found. Please check the username.');
  }
  if (response.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
  }
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeGitHubProfile(
  username: string,
  jobRole: string = 'Full Stack Developer',
  customSkills?: string[]
): Promise<AnalysisData> {
  // 1. Fetch user profile
  const profile: GitHubProfile = await githubFetch(`${GITHUB_API}/users/${username}`);

  // 2. Fetch all repositories (up to 100)
  const allRepos: GitHubRepo[] = await githubFetch(
    `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`
  );

  // Filter out forks for analysis (but keep them in count)
  const ownRepos = allRepos.filter((r) => !r.fork);

  // 3. Calculate language distribution (bytes-based for accuracy)
  const languageBytes: Record<string, number> = {};
  
  // Fetch language data for top repos for accurate byte counts
  const topReposForLang = ownRepos.slice(0, 15);
  await Promise.all(
    topReposForLang.map(async (repo) => {
      try {
        const langs: Record<string, number> = await githubFetch(
          `${GITHUB_API}/repos/${repo.full_name}/languages`
        );
        Object.entries(langs).forEach(([lang, bytes]) => {
          languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
        });
      } catch {
        // Skip on error
      }
    })
  );

  // Calculate percentages
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  const languagePercentages: Record<string, number> = {};
  Object.entries(languageBytes).forEach(([lang, bytes]) => {
    languagePercentages[lang] = totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0;
  });

  // 4. Top repositories (sorted by stars)
  const topRepositories = [...ownRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  // 5. Calculate activity from pushed_at dates
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const recentlyActiveRepos = ownRepos.filter((r) => {
    const pushed = new Date(r.pushed_at);
    return pushed >= oneYearAgo;
  }).length;

  // Build monthly commit activity from repo push dates (approximation)
  const monthlyData: Record<string, number> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = 0;
  }

  // Fetch commit activity stats for top active repos
  let totalCommitsLastYear = 0;
  const activeReposForCommits = ownRepos
    .filter((r) => new Date(r.pushed_at) >= oneYearAgo)
    .slice(0, 10);

  await Promise.all(
    activeReposForCommits.map(async (repo) => {
      try {
        // Get commits from the last year for this repo
        const commits = await githubFetch(
          `${GITHUB_API}/repos/${repo.full_name}/commits?author=${username}&since=${oneYearAgo.toISOString()}&per_page=100`
        );
        if (Array.isArray(commits)) {
          totalCommitsLastYear += commits.length;
          commits.forEach((commit: any) => {
            const date = new Date(commit.commit?.author?.date || commit.commit?.committer?.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (key in monthlyData) {
              monthlyData[key]++;
            }
          });
        }
      } catch {
        // Skip on error
      }
    })
  );

  const monthlyCommits = Object.entries(monthlyData).map(([key, commits]) => {
    const [, month] = key.split('-');
    return {
      month: monthNames[parseInt(month) - 1],
      commits,
    };
  });

  const avgCommitsPerMonth = Math.round(totalCommitsLastYear / 12);

  // 6. Calculate scores
  const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = ownRepos.reduce((sum, r) => sum + r.forks_count, 0);
  const reposWithDescription = ownRepos.filter((r) => r.description).length;
  const reposWithTopics = ownRepos.filter((r) => r.topics && r.topics.length > 0).length;

  // Skill Match Score (0-100) - prefer customSkills if provided
  const requiredSkills = (customSkills && customSkills.length > 0)
    ? customSkills
    : (ROLE_SKILLS[jobRole] || ROLE_SKILLS['Full Stack Developer']);
  const userSkills = Object.keys(languageBytes).map(normalizeSkill);
  const matchedSkills = requiredSkills.filter((s) =>
    userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter((s) => !matchedSkills.includes(s));
  const skillMatchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
  const skill_match = Math.round(skillMatchPercentage);

  // Activity Score (0-100) - based on commits in last year
  const activity_score = Math.min(100, Math.round((totalCommitsLastYear / 200) * 100));

  // Repo Quality Score (0-100) - based on stars, descriptions, topics
  const avgStars = ownRepos.length > 0 ? totalStars / ownRepos.length : 0;
  const descRatio = ownRepos.length > 0 ? reposWithDescription / ownRepos.length : 0;
  const topicRatio = ownRepos.length > 0 ? reposWithTopics / ownRepos.length : 0;
  const repo_quality = Math.min(
    100,
    Math.round(avgStars * 5 + descRatio * 30 + topicRatio * 30 + Math.min(ownRepos.length * 2, 20))
  );

  // Open Source Score (0-100) - based on stars, forks, followers
  const open_source = Math.min(
    100,
    Math.round(Math.log10(totalStars + 1) * 25 + Math.log10(totalForks + 1) * 15 + Math.log10(profile.followers + 1) * 20)
  );

  // Consistency Score (0-100) - based on activity spread across months
  const monthsWithActivity = monthlyCommits.filter((m) => m.commits > 0).length;
  const consistency = Math.round((monthsWithActivity / 12) * 100);

  // Overall Score - weighted
  const overall_score = Math.round(
    skill_match * 0.30 +
      activity_score * 0.20 +
      repo_quality * 0.20 +
      open_source * 0.15 +
      consistency * 0.15
  );

  // 7. Generate strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (skill_match >= 70) strengths.push(`Strong skill match (${skill_match}%) for ${jobRole} role`);
  else if (skill_match < 40) weaknesses.push(`Low skill match (${skill_match}%) for ${jobRole} role`);

  if (activity_score >= 70) strengths.push(`Highly active with ${totalCommitsLastYear} commits in the last year`);
  else if (activity_score < 40) weaknesses.push(`Low recent activity (${totalCommitsLastYear} commits in last year)`);

  if (totalStars >= 50) strengths.push(`Well-recognized with ${totalStars} total stars across repositories`);
  else if (totalStars < 5) weaknesses.push(`Limited recognition (${totalStars} total stars)`);

  if (profile.followers >= 50) strengths.push(`Strong community presence (${profile.followers} followers)`);
  else if (profile.followers < 5) weaknesses.push(`Small follower base (${profile.followers} followers)`);

  if (consistency >= 70) strengths.push(`Consistent contributor (active in ${monthsWithActivity}/12 months)`);
  else if (consistency < 30) weaknesses.push(`Inconsistent activity (only active in ${monthsWithActivity}/12 months)`);

  if (ownRepos.length >= 10) strengths.push(`Diverse portfolio with ${ownRepos.length} original repositories`);
  else if (ownRepos.length < 3) weaknesses.push(`Limited portfolio (only ${ownRepos.length} original repositories)`);

  if (descRatio >= 0.7) strengths.push('Good documentation practices (most repos have descriptions)');
  else if (descRatio < 0.3) weaknesses.push('Poor documentation (few repos have descriptions)');

  if (matchedSkills.length > 0) strengths.push(`Proficient in: ${matchedSkills.slice(0, 4).join(', ')}`);
  if (missingSkills.length > 0 && missingSkills.length <= 4) {
    weaknesses.push(`Missing skills: ${missingSkills.join(', ')}`);
  } else if (missingSkills.length > 4) {
    weaknesses.push(`Missing key skills: ${missingSkills.slice(0, 4).join(', ')}...`);
  }

  if (strengths.length === 0) strengths.push('Has an active GitHub presence');
  if (weaknesses.length === 0) weaknesses.push('No significant weaknesses identified');

  // 8. Decision
  let decision: 'selected' | 'consider' | 'rejected';
  if (overall_score >= 75) decision = 'selected';
  else if (overall_score >= 50) decision = 'consider';
  else decision = 'rejected';

  return {
    profile,
    repositories: ownRepos,
    topRepositories,
    languages: languageBytes,
    languagePercentages,
    scores: {
      overall_score,
      skill_match,
      activity_score,
      repo_quality,
      open_source,
      consistency,
    },
    evaluation: {
      strengths,
      weaknesses,
      decision,
    },
    activity: {
      lastYearCommits: totalCommitsLastYear,
      monthlyCommits,
      avgCommitsPerMonth,
      totalCommits: totalCommitsLastYear,
      activeRepos: ownRepos.length,
      recentlyActiveRepos,
    },
    skills: {
      matched: matchedSkills,
      missing: missingSkills,
      matchPercentage: Math.round(skillMatchPercentage),
    },
  };
}
