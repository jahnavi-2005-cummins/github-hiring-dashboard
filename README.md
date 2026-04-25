# GitHub Dashboard Analyzer for Smart Hiring

A comprehensive full-stack web application designed to assist HR teams in evaluating candidates based on their GitHub profiles using data-driven insights.

## 🎯 Project Overview

The GitHub Dashboard Analyzer is a smart hiring assistant that:
- Objectively evaluates candidates based on GitHub activity
- Automates skill analysis using GitHub API
- Enables side-by-side candidate comparison
- Supports data-driven hiring decisions
- Provides role-based skill matching

## ✨ Key Features

### 🔐 Authentication & User Management
- Secure login/signup system with JWT authentication
- Role-based access control (Admin, HR User)
- Pre-approved HR email verification
- Session management

### 📊 Candidate Analysis
- GitHub profile analysis via GitHub API
- Smart scoring system (0-100) based on:
  - Skills Match (30%)
  - Recent Activity (20%)
  - Repository Quality (20%)
  - Open Source Contribution (15%)
  - Consistency (15%)
- Strengths and weaknesses identification
- Automated decision recommendations (Selected/Consider/Rejected)

### 🎯 Job Role-Based Skill Matching
- Customizable job roles with skill requirements
- Skill aliases support (e.g., JS, JavaScript, java script)
- Core, secondary, and bonus skill categorization
- Automatic skill extraction from repositories

### 📈 Dashboard & Analytics
- Real-time dashboard with key metrics
- Selection ratio visualization
- Most searched roles tracking
- Common skills analysis
- Search history tracking

### ⚔️ Candidate Comparison
- Side-by-side profile comparison
- Score comparison
- Skills gap analysis
- Activity comparison
- Automated recommendations

### 📄 Resume Generator
- Generate resumes from GitHub data
- PDF export functionality
- Professional formatting

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts and visualizations
- **jsPDF** - PDF generation
- **React Router** - Navigation

### Backend
- **Spring Boot 3** - REST APIs
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database access
- **JWT** - Token-based authentication

### Database
- **MySQL 8** - Relational database
- Normalized schema design
- Foreign key relationships

## 📁 Project Structure

```
github-dashboard-analyzer/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/
│   └── package.json
├── backend/                  # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/analyzer/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── repository/  # Data access
│   │       ├── model/       # Entity classes
│   │       ├── config/      # Configuration
│   │       └── security/    # Security config
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── schema.sql
│   └── pom.xml
├── README.md
├── DATABASE.md
└── SETUP.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java JDK 17+
- MySQL 8+
- Maven 3.8+
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
mvn spring-boot:run
```

### Database Setup
```bash
mysql -u root -p < schema.sql
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/signup | HR user signup |
| GET | /api/candidates | Get all candidates |
| POST | /api/candidates/analyze | Analyze GitHub profile |
| GET | /api/candidates/:id | Get candidate details |
| PUT | /api/candidates/:id/decision | Update candidate decision |
| GET | /api/roles | Get job roles |
| POST | /api/roles | Create job role |
| GET | /api/dashboard/stats | Get dashboard statistics |
| POST | /api/compare | Compare candidates |
| GET | /api/history | Get search history |

## 🔒 Security

- JWT-based authentication
- Password hashing with BCrypt
- Role-based access control
- CORS configuration
- Input validation
- SQL injection prevention

## 📈 Scoring Algorithm

The candidate scoring system evaluates profiles based on:

1. **Skills Match (30%)**: Alignment with job role requirements
2. **Activity Score (20%)**: Recent commit activity and engagement
3. **Repository Quality (20%)**: Stars, forks, documentation quality
4. **Open Source (15%)**: Contributions to external projects
5. **Consistency (15%)**: Regular contribution patterns

## 📄 Documentation

- [DATABASE.md](./DATABASE.md) - Database schema and relationships
- [SETUP.md](./SETUP.md) - Detailed setup instructions

## 👥 Team Roles

- **Admin**: Full system access, user management, settings
- **HR User**: Candidate analysis, comparison, decision making

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
