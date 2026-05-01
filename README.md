# ⬡ GitHub Hiring Dashboard Analyzer

### A smart, data-driven hiring assistant for HR teams — powered by the GitHub Public API.

Analyze any GitHub profile in seconds. Get a full breakdown of skills, activity, repository quality, and open-source contributions — all scored, visualized, and ready for your hiring decision.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Database Schema](#-database-schema) · [Screenshots](#-screenshots)

</div>

---

## 📌 Repository Info

| Field | Details |
|-------|---------|
| **Repository Name** | `github-hiring-dashboard-analyzer` |
| **Description** | A full-stack smart hiring assistant that evaluates developer candidates using real-time GitHub profile data, AI-powered scoring, and role-based skill matching — built with React + Spring Boot + MySQL. |
| **Topics / Tags** | `hiring-tool` `github-api` `react` `spring-boot` `mysql` `jwt` `hr-tech` `developer-analytics` `typescript` `tailwindcss` |

---

## 🎯 What Is This?

The **GitHub Hiring Dashboard Analyzer** eliminates guesswork from technical hiring. Instead of relying solely on resumes, HR teams can paste a GitHub username and instantly receive a comprehensive candidate evaluation:

- A **0–100 score** computed from 5 weighted metrics
- **Strengths and weaknesses** auto-generated from real data
- **Job role skill matching** with gap analysis
- **Charts and visualizations** — language distribution, monthly commits, activity heatmap, radar charts
- **Side-by-side comparison** of two candidates
- A **final recommendation** — Selected, Consider, or Rejected

---

## ✨ Features

### 🔐 Authentication & Access Control
- JWT-based login and signup
- Role-based access: **Admin** and **HR User**
- Pre-approved HR email whitelist (`preapproved_hr` table)
- BCrypt password hashing
- Token auto-refresh via `localStorage`

### 📊 GitHub Profile Analysis (Live Data)
- Fetches real data from the **GitHub Public API** — no mocks
- Analyzes up to 100 repositories per user
- Detects languages by **byte count** (not just repo count) for accuracy
- Fetches commit history across active repos for the last 12 months
- Generates a skill match against your selected job role

### 🧠 Smart Scoring System (0–100)

| Metric | Weight | How It's Calculated |
|--------|--------|---------------------|
| **Skills Match** | 30% | Languages used vs. required skills for the job role |
| **Recent Activity** | 20% | Total commits in the last year (capped at 200) |
| **Repo Quality** | 20% | Stars, descriptions, topics, portfolio size |
| **Open Source** | 15% | Log-scaled stars, forks, and followers |
| **Consistency** | 15% | Number of months with at least one commit (out of 12) |

> Score ≥ 80 → **Selected** | Score 60–79 → **Consider** | Score < 60 → **Rejected**

### 🎯 Job Role–Based Skill Matching
- 5 default roles out of the box: Frontend, Backend, Full Stack, DevOps, Mobile
- Skill aliases handle variations: `JS`, `JavaScript`, `java script` → all normalized
- HR can **add, edit, and delete** job roles directly from the UI
- Roles saved to `localStorage` and synced to backend DB

### 📈 Analytics Dashboard
- Stat cards: Total, Selected, Consider, Rejected
- Pie/donut chart: Candidate pipeline breakdown
- Bar charts: Most searched roles, most common skills, monthly commit activity
- Radar chart: 5-metric skill profile overview
- Language distribution (pie chart with percentage breakdown)
- Top repositories table with stars, forks, and language tags

### ⚔️ Candidate Comparison
- Analyze two GitHub usernames simultaneously (parallel API calls)
- Compare scores, activity, skill match, repos, and followers side-by-side
- Auto-generated recommendation with winner highlight

### 📋 Candidate Pipeline Management
- Filter candidates by decision: All / Selected / Consider / Rejected
- Quick-action buttons to update decisions inline
- Decision synced to backend MySQL DB
- Avatar, username, score, and analyzed date shown in table

### 🔔 Admin Panel
- Total searches and selection rate at a glance
- Active job roles count
- System info (data source, backend, storage)
- User management overview

---

## 🛠 Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7.2 | Build tool & dev server |
| Tailwind CSS | 4.1 | Utility-first styling |
| Recharts | 3.8 | Charts — bar, pie, radar, area |
| Lucide React | 1.8 | Icon library |
| jsPDF | 4.2 | PDF resume export |
| React Router DOM | 7.14 | Client-side routing |
| Axios | 1.15 | HTTP client for backend API |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Spring Boot | 3.2.0 | REST API framework |
| Spring Security | — | Auth & RBAC |
| Spring Data JPA | — | ORM & database access |
| Spring WebFlux | — | Reactive HTTP client for GitHub API |
| JJWT | 0.12.3 | JWT generation & validation |
| Lombok | — | Boilerplate reduction |
| Commons Lang3 | — | String utilities |

### Database
| Tool | Version | Purpose |
|------|---------|---------|
| MySQL | 8.0+ | Relational data storage |
| Hibernate | — | JPA implementation |

### External
| Service | Usage |
|---------|-------|
| GitHub Public API v3 | Profile, repos, languages, commits |

---

## 📁 Project Structure

```
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
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Java JDK | 17+ | https://adoptium.net |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |
| Maven | 3.8+ | https://maven.apache.org |
| Git | Any | https://git-scm.com |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/github-hiring-dashboard-analyzer.git
cd github-hiring-dashboard-analyzer
```

---

### 2️⃣ Database Setup

```sql
-- Login to MySQL
mysql -u root -p

-- Create the database (or let Spring Boot auto-create it)
CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;
```

> **Note:** The backend is configured with `ddl-auto: update` — Hibernate will auto-create all tables on first run.

---

### 3️⃣ Backend Setup

```bash
cd backend
```

Edit `src/main/resources/application.yml` — update your DB credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/github_analyzer?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: YOUR_MYSQL_PASSWORD   # ← change this
```

Optionally add a GitHub token for higher API rate limits (5000/hr vs 60/hr):

```yaml
app:
  github:
    token: ghp_your_token_here     # optional but recommended
```

Run the backend:

```bash
mvn spring-boot:run
```

Backend starts at → **http://localhost:8080**

---

### 4️⃣ Frontend Setup

Open a new terminal:

```bash
cd ..          # back to project root
npm install
npm run dev
```

Frontend starts at → **http://localhost:5173**

---

### 5️⃣ Environment Variables (Optional)

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

### ✅ Default Credentials

The `DataSeeder` seeds an admin account on first run:

| Field | Value |
|-------|-------|
| Email | `admin@analyzer.com` |
| Password | `admin123` |
| Role | `admin` |

> To add pre-approved HR emails, insert them into the `preapproved_hr` table before users sign up.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | Login with email & password → returns JWT |
| `POST` | `/api/auth/signup` | ❌ | Register new HR user (must be pre-approved) |
| `GET` | `/api/candidates` | ✅ | List all analyzed candidates |
| `POST` | `/api/candidates/save-analysis` | ✅ | Save a new analysis result |
| `POST` | `/api/candidates/decision` | ✅ | Update hiring decision for a candidate |
| `GET` | `/api/stats/dashboard` | ✅ | Get dashboard stats (totals, ratios) |
| `GET` | `/api/roles` | ✅ | List all job roles |
| `POST` | `/api/roles` | ✅ | Create a new job role |
| `PUT` | `/api/roles/{id}` | ✅ | Update a job role |
| `DELETE` | `/api/roles/{id}` | ✅ | Delete a job role |

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## 🗄 Database Schema

The application uses **12 normalized tables**:

```
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
```

See [`DATABASE.md`](./DATABASE.md) for full schema with field types, relationships, and sample data.

---

## 🧠 Scoring Algorithm

```
Overall Score = (Skill Match × 0.30)
              + (Activity Score × 0.20)
              + (Repo Quality × 0.20)
              + (Open Source × 0.15)
              + (Consistency × 0.15)
```

**Skill Match** — Fetches byte-accurate language data from the GitHub API for the top 15 repos. Normalizes skill names using the alias table. Compares to the job role's required skills list.

**Activity Score** — Counts commits authored by the user in the last 365 days across their 10 most recently pushed repos. Capped at 200 commits = 100%.

**Repo Quality** — Weighted combination of: average stars per repo, % of repos with descriptions, % of repos with topics, and portfolio size.

**Open Source Score** — Log-scaled calculation using total stars, forks, and GitHub followers — rewards genuine community impact.

**Consistency** — Counts how many of the last 12 calendar months had at least one commit. 12/12 = 100%.

---

## 🔒 Security

- Passwords hashed with **BCrypt** (Spring Security default)
- JWT tokens expire after **24 hours**
- All API routes protected via `SecurityConfig` (except `/api/auth/**`)
- CORS configured for frontend origin
- Input validated with `@Valid` and Spring Validation annotations
- SQL injection prevented via JPA parameterized queries

---

## 📸 Screenshots

| Screen | Description |
|--------|-------------|
| **Login** | Clean login form with gradient background |
| **Dashboard** | Stat cards + donut chart + role bar chart |
| **Search** | Username input → live GitHub analysis → score ring + charts |
| **Analytics** | Radar chart, commit bar chart, language pie chart, repo table |
| **Compare** | Two profiles side-by-side with winner highlight |
| **Candidates** | Filterable table with inline decision controls |
| **Job Roles** | Editable cards — add/edit/delete roles and their required skills |
| **Admin Panel** | System info + user management + stats |

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📚 Additional Documentation

| File | Contents |
|------|---------|
| [`DATABASE.md`](./DATABASE.md) | Full table schemas, ER diagram, sample data |

