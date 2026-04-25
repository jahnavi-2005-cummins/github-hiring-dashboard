⬡ GitHub Hiring Dashboard Analyzer
A smart, data-driven hiring assistant for HR teams — powered by the GitHub Public API.
Analyze any GitHub profile in seconds. Get a full breakdown of skills, activity, repository quality, and open-source contributions — all scored, visualized, and ready for your hiring decision.
Features · Tech Stack · Getting Started · API Reference · Database Schema · Screenshots
</div>

📌 Repository Info
FieldDetailsRepository Namegithub-hiring-dashboard-analyzerDescriptionA full-stack smart hiring assistant that evaluates developer candidates using real-time GitHub profile data, AI-powered scoring, and role-based skill matching — built with React + Spring Boot + MySQL.Topics / Tagshiring-tool github-api react spring-boot mysql jwt hr-tech developer-analytics typescript tailwindcss

🎯 What Is This?
The GitHub Hiring Dashboard Analyzer eliminates guesswork from technical hiring. Instead of relying solely on resumes, HR teams can paste a GitHub username and instantly receive a comprehensive candidate evaluation:

A 0–100 score computed from 5 weighted metrics
Strengths and weaknesses auto-generated from real data
Job role skill matching with gap analysis
Charts and visualizations — language distribution, monthly commits, activity heatmap, radar charts
Side-by-side comparison of two candidates
A final recommendation — Selected, Consider, or Rejected


✨ Features
🔐 Authentication & Access Control

JWT-based login and signup
Role-based access: Admin and HR User
Pre-approved HR email whitelist (preapproved_hr table)
BCrypt password hashing
Token auto-refresh via localStorage

📊 GitHub Profile Analysis (Live Data)

Fetches real data from the GitHub Public API — no mocks
Analyzes up to 100 repositories per user
Detects languages by byte count (not just repo count) for accuracy
Fetches commit history across active repos for the last 12 months
Generates a skill match against your selected job role

🧠 Smart Scoring System (0–100)
MetricWeightHow It's CalculatedSkills Match30%Languages used vs. required skills for the job roleRecent Activity20%Total commits in the last year (capped at 200)Repo Quality20%Stars, descriptions, topics, portfolio sizeOpen Source15%Log-scaled stars, forks, and followersConsistency15%Number of months with at least one commit (out of 12)

Score ≥ 80 → Selected | Score 60–79 → Consider | Score < 60 → Rejected

🎯 Job Role–Based Skill Matching

5 default roles out of the box: Frontend, Backend, Full Stack, DevOps, Mobile
Skill aliases handle variations: JS, JavaScript, java script → all normalized
HR can add, edit, and delete job roles directly from the UI
Roles saved to localStorage and synced to backend DB

📈 Analytics Dashboard

Stat cards: Total, Selected, Consider, Rejected
Pie/donut chart: Candidate pipeline breakdown
Bar charts: Most searched roles, most common skills, monthly commit activity
Radar chart: 5-metric skill profile overview
Language distribution (pie chart with percentage breakdown)
Top repositories table with stars, forks, and language tags

⚔️ Candidate Comparison

Analyze two GitHub usernames simultaneously (parallel API calls)
Compare scores, activity, skill match, repos, and followers side-by-side
Auto-generated recommendation with winner highlight

📋 Candidate Pipeline Management

Filter candidates by decision: All / Selected / Consider / Rejected
Quick-action buttons to update decisions inline
Decision synced to backend MySQL DB
Avatar, username, score, and analyzed date shown in table

🔔 Admin Panel

Total searches and selection rate at a glance
Active job roles count
System info (data source, backend, storage)
User management overview


🛠 Tech Stack
Frontend
ToolVersionPurposeReact19.2UI frameworkTypeScript5.9Type safetyVite7.2Build tool & dev serverTailwind CSS4.1Utility-first stylingRecharts3.8Charts — bar, pie, radar, areaLucide React1.8Icon libraryjsPDF4.2PDF resume exportReact Router DOM7.14Client-side routingAxios1.15HTTP client for backend API
Backend
ToolVersionPurposeSpring Boot3.2.0REST API frameworkSpring Security—Auth & RBACSpring Data JPA—ORM & database accessSpring WebFlux—Reactive HTTP client for GitHub APIJJWT0.12.3JWT generation & validationLombok—Boilerplate reductionCommons Lang3—String utilities
Database
ToolVersionPurposeMySQL8.0+Relational data storageHibernate—JPA implementation
External
ServiceUsageGitHub Public API v3Profile, repos, languages, commits

📁 Project Structure
github-hiring-dashboard-analyzer/
│
├── src/                              # React frontend
│   ├── App.tsx                       # Root component — routing, state, all pages
│   ├── main.tsx                      # Vite entry point
│   ├── index.css                     # Tailwind base styles
│   ├── components/
│   │   ├── CandidateAnalytics.tsx    # Deep analytics — charts, heatmap, radar
│   │   └── Toast.tsx                 # Toast notification system
│   ├── services/
│   │   └── githubService.ts          # GitHub API integration & scoring engine
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces
│   └── utils/
│       └── cn.ts                     # className utility
│
├── backend/
│   └── src/main/java/com/analyzer/
│       ├── GitHubAnalyzerApplication.java
│       ├── controller/
│       │   ├── AuthController.java        # POST /api/auth/login, /signup
│       │   ├── AnalysisController.java    # POST /api/candidates/save-analysis
│       │   ├── CandidateController.java   # GET/POST /api/candidates
│       │   ├── JobRoleController.java     # CRUD /api/roles
│       │   └── StatsController.java       # GET /api/stats/dashboard
│       ├── service/
│       │   └── GitHubApiService.java      # GitHub API calls (Spring WebFlux)
│       ├── model/                         # JPA entities (12 tables)
│       ├── repository/                    # Spring Data JPA repos
│       ├── dto/                           # Request/Response DTOs
│       ├── security/
│       │   ├── JwtUtil.java
│       │   └── SecurityConfig.java
│       └── config/
│           ├── DataSeeder.java            # Seeds job roles & preapproved emails
│           ├── HrUserRoleConverter.java
│           └── AnalysisDecisionConverter.java
│   └── src/main/resources/
│       └── application.yml               # DB, JWT, scoring weights config
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── DATABASE.md
├── SETUP.md
└── BACKEND_SETUP.md

🚀 Getting Started
Prerequisites
Make sure you have these installed:
SoftwareVersionDownloadNode.js18+https://nodejs.orgJava JDK17+https://adoptium.netMySQL8.0+https://dev.mysql.com/downloadsMaven3.8+https://maven.apache.orgGitAnyhttps://git-scm.com

1️⃣ Clone the Repository
bashgit clone https://github.com/YOUR_USERNAME/github-hiring-dashboard-analyzer.git
cd github-hiring-dashboard-analyzer

2️⃣ Database Setup
sql-- Login to MySQL
mysql -u root -p

-- Create the database (or let Spring Boot auto-create it)
CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

Note: The backend is configured with ddl-auto: update — Hibernate will auto-create all tables on first run.


3️⃣ Backend Setup
bashcd backend
Edit src/main/resources/application.yml — update your DB credentials:
yamlspring:
  datasource:
    url: jdbc:mysql://localhost:3306/github_analyzer?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: YOUR_MYSQL_PASSWORD   # ← change this
Optionally add a GitHub token for higher API rate limits (5000/hr vs 60/hr):
yamlapp:
  github:
    token: ghp_your_token_here     # optional but recommended
Run the backend:
bashmvn spring-boot:run
Backend starts at → http://localhost:8080

4️⃣ Frontend Setup
Open a new terminal:
bashcd ..          # back to project root
npm install
npm run dev
Frontend starts at → http://localhost:5173

5️⃣ Environment Variables (Optional)
Create a .env file in the root:
envVITE_API_BASE_URL=http://localhost:8080

✅ Default Credentials
The DataSeeder seeds an admin account on first run:
FieldValueEmailadmin@analyzer.comPasswordadmin123Roleadmin

To add pre-approved HR emails, insert them into the preapproved_hr table before users sign up.


📡 API Reference
MethodEndpointAuthDescriptionPOST/api/auth/login❌Login with email & password → returns JWTPOST/api/auth/signup❌Register new HR user (must be pre-approved)GET/api/candidates✅List all analyzed candidatesPOST/api/candidates/save-analysis✅Save a new analysis resultPOST/api/candidates/decision✅Update hiring decision for a candidateGET/api/stats/dashboard✅Get dashboard stats (totals, ratios)GET/api/roles✅List all job rolesPOST/api/roles✅Create a new job rolePUT/api/roles/{id}✅Update a job roleDELETE/api/roles/{id}✅Delete a job role
All protected routes require: Authorization: Bearer <JWT_TOKEN>

🗄 Database Schema
The application uses 12 normalized tables:
preapproved_hr          → Controls who can sign up as HR
hr_users                → Registered HR accounts (hashed passwords, roles)
candidates              → GitHub profiles that have been analyzed
analysis_results        → Computed scores and evaluation per candidate
selected_candidates     → FK → candidates + hr_users
rejected_candidates     → FK → candidates + hr_users
job_roles               → Role definitions (Frontend, Backend, etc.)
skills_master           → Master list of all skills
skill_aliases           → Variations of skill names (JS → JavaScript)
role_skills_mapping     → Which skills belong to which role, with weights
search_history          → Per-HR search log with score snapshots
alerts                  → System notifications for HR/Admin
See DATABASE.md for full schema with field types, relationships, and sample data.

🧠 Scoring Algorithm
Overall Score = (Skill Match × 0.30)
              + (Activity Score × 0.20)
              + (Repo Quality × 0.20)
              + (Open Source × 0.15)
              + (Consistency × 0.15)
Skill Match — Fetches byte-accurate language data from the GitHub API for the top 15 repos. Normalizes skill names using the alias table. Compares to the job role's required skills list.
Activity Score — Counts commits authored by the user in the last 365 days across their 10 most recently pushed repos. Capped at 200 commits = 100%.
Repo Quality — Weighted combination of: average stars per repo, % of repos with descriptions, % of repos with topics, and portfolio size.
Open Source Score — Log-scaled calculation using total stars, forks, and GitHub followers — rewards genuine community impact.
Consistency — Counts how many of the last 12 calendar months had at least one commit. 12/12 = 100%.

🔒 Security

Passwords hashed with BCrypt (Spring Security default)
JWT tokens expire after 24 hours
All API routes protected via SecurityConfig (except /api/auth/**)
CORS configured for frontend origin
Input validated with @Valid and Spring Validation annotations
SQL injection prevented via JPA parameterized queries


📸 Screenshots
ScreenDescriptionLoginClean login form with gradient backgroundDashboardStat cards + donut chart + role bar chartSearchUsername input → live GitHub analysis → score ring + chartsAnalyticsRadar chart, commit bar chart, language pie chart, repo tableCompareTwo profiles side-by-side with winner highlightCandidatesFilterable table with inline decision controlsJob RolesEditable cards — add/edit/delete roles and their required skillsAdmin PanelSystem info + user management + stats

🤝 Contributing

Fork the repository
Create your branch: git checkout -b feature/your-feature
Commit your changes: git commit -m 'feat: add your feature'
Push to the branch: git push origin feature/your-feature
Open a Pull Request


📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

📚 Additional Documentation
FileContentsDATABASE.mdFull table schemas, ER diagram, sample dataSETUP.mdStep-by-step local setup guideBACKEND_SETUP.mdBackend-specific configuration and deployment

<div align="center">
Built with ❤️ for smarter, fairer, data-driven hiring.
</div>
