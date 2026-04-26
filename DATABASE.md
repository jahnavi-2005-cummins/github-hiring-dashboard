# Database Schema Documentation

## Overview

The GitHub Dashboard Analyzer uses a normalized MySQL database schema with 11 main tables designed for efficient candidate analysis and HR management.

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  preapproved_hr │     │    hr_users     │     │   job_roles     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ email           │     │ name            │     │ role_name       │
│ status          │     │ email (UNIQUE)  │     │ created_at      │
│ created_at      │     │ password        │     └────────┬────────┘
└─────────────────┘     │ role            │              │
                        │ created_at      │              │
                        └────────┬────────┘              │
                                 │                       │
                                 │                       ▼
                        ┌────────┴────────┐     ┌─────────────────┐
                        │ search_history  │     │ role_skills_map │
                        ├─────────────────┤     ├─────────────────┤
                        │ id (PK)         │     │ id (PK)         │
                        │ hr_id (FK)      │     │ role_id (FK)    │
                        │ candidate_id(FK)│     │ skill_id (FK)   │
                        │ searched_at     │     │ weight          │
                        │ prev_score      │     │ type            │
                        │ updated_score   │     └────────┬────────┘
                        └─────────────────┘              │
                                                         │
                        ┌─────────────────┐              │
                        │    candidates   │              │
                        ├─────────────────┤              │
                        │ id (PK)         │◄─────────────┘
                        │ github_username │
                        │ name            │     ┌─────────────────┐
                        │ profile_url     │     │  skills_master  │
                        │ last_analyzed   │     ├─────────────────┤
                        │ avatar_url      │     │ id (PK)         │
                        │ public_repos    │     │ skill_name      │
                        │ followers       │     │ category        │
                        └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │                       │
                        ┌────────┴────────┐     ┌────────┴────────┐
                        │ analysis_results│     │  skill_aliases  │
                        ├─────────────────┤     ├─────────────────┤
                        │ id (PK)         │     │ id (PK)         │
                        │ candidate_id(FK)│     │ skill_id (FK)   │
                        │ score           │     │ alias           │
                        │ skill_match     │     └─────────────────┘
                        │ activity_score  │
                        │ repo_quality    │     ┌─────────────────┐
                        │ open_source     │     │ selected_cands  │
                        │ consistency     │     ├─────────────────┤
                        │ strengths       │     │ id (PK)         │
                        │ weaknesses      │     │ candidate_id(FK)│
                        │ decision        │     │ hr_id (FK)      │
                        │ analyzed_at     │     │ selected_at     │
                        └─────────────────┘     └─────────────────┘

                        ┌─────────────────┐
                        │ rejected_cands  │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ candidate_id(FK)│
                        │ hr_id (FK)      │
                        │ rejected_at     │
                        └─────────────────┘
```

## Table Schemas

### 1. preapproved_hr

Stores emails of HR personnel authorized to create accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | HR email address |
| status | ENUM | NOT NULL, DEFAULT 'active' | Account status (active/inactive) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |

```sql
CREATE TABLE preapproved_hr (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. hr_users

Stores registered HR user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| password | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| role | ENUM | NOT NULL | User role (admin/hr) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |

```sql
CREATE TABLE hr_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr') NOT NULL DEFAULT 'hr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. candidates

Stores GitHub user profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| github_username | VARCHAR(100) | NOT NULL, UNIQUE | GitHub username |
| name | VARCHAR(100) | NULL | Display name from GitHub |
| profile_url | VARCHAR(255) | NOT NULL | GitHub profile URL |
| avatar_url | VARCHAR(255) | NULL | Avatar image URL |
| public_repos | INT | DEFAULT 0 | Number of public repositories |
| followers | INT | DEFAULT 0 | Number of followers |
| following | INT | DEFAULT 0 | Number of following |
| last_analyzed | TIMESTAMP | NULL | Last analysis timestamp |

```sql
CREATE TABLE candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    github_username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    profile_url VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    public_repos INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    last_analyzed TIMESTAMP NULL
);
```

### 4. analysis_results

Stores computed candidate evaluation scores.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| candidate_id | INT | FOREIGN KEY | Reference to candidates |
| score | INT | NOT NULL | Overall score (0-100) |
| skill_match | DECIMAL(5,2) | NOT NULL | Skills match percentage |
| activity_score | DECIMAL(5,2) | NOT NULL | Activity score percentage |
| repo_quality | DECIMAL(5,2) | NOT NULL | Repository quality score |
| open_source | DECIMAL(5,2) | NOT NULL | Open source contribution score |
| consistency | DECIMAL(5,2) | NOT NULL | Consistency score |
| strengths | TEXT | NULL | Identified strengths |
| weaknesses | TEXT | NULL | Identified weaknesses |
| decision | ENUM | NOT NULL | Hiring decision |
| analyzed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Analysis timestamp |

```sql
CREATE TABLE analysis_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    score INT NOT NULL,
    skill_match DECIMAL(5,2) NOT NULL,
    activity_score DECIMAL(5,2) NOT NULL,
    repo_quality DECIMAL(5,2) NOT NULL,
    open_source DECIMAL(5,2) NOT NULL,
    consistency DECIMAL(5,2) NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    decision ENUM('selected', 'consider', 'rejected') NOT NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);
```

### 5. selected_candidates

Tracks candidates marked as selected.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| candidate_id | INT | FOREIGN KEY | Reference to candidates |
| hr_id | INT | FOREIGN KEY | Reference to hr_users |
| selected_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Selection timestamp |

```sql
CREATE TABLE selected_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    hr_id INT NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (hr_id) REFERENCES hr_users(id) ON DELETE CASCADE
);
```

### 6. rejected_candidates

Tracks candidates marked as rejected.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| candidate_id | INT | FOREIGN KEY | Reference to candidates |
| hr_id | INT | FOREIGN KEY | Reference to hr_users |
| rejected_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Rejection timestamp |

```sql
CREATE TABLE rejected_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    hr_id INT NOT NULL,
    rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (hr_id) REFERENCES hr_users(id) ON DELETE CASCADE
);
```

### 7. job_roles

Defines job positions for skill matching.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| role_name | VARCHAR(100) | NOT NULL, UNIQUE | Job role name |
| description | TEXT | NULL | Role description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

```sql
CREATE TABLE job_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. skills_master

Master list of all skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| skill_name | VARCHAR(100) | NOT NULL, UNIQUE | Canonical skill name |
| category | ENUM | NULL | Skill category |

```sql
CREATE TABLE skills_master (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('frontend', 'backend', 'database', 'devops', 'mobile', 'tools')
);
```

### 9. skill_aliases

Handles skill name variations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| skill_id | INT | FOREIGN KEY | Reference to skills_master |
| alias | VARCHAR(100) | NOT NULL | Alternative skill name |

```sql
CREATE TABLE skill_aliases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_id INT NOT NULL,
    alias VARCHAR(100) NOT NULL,
    FOREIGN KEY (skill_id) REFERENCES skills_master(id) ON DELETE CASCADE
);
```

### 10. role_skills_mapping

Maps skills to job roles with weights.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| role_id | INT | FOREIGN KEY | Reference to job_roles |
| skill_id | INT | FOREIGN KEY | Reference to skills_master |
| weight | DECIMAL(5,2) | NOT NULL | Importance weight |
| type | ENUM | NOT NULL | Skill type |

```sql
CREATE TABLE role_skills_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    skill_id INT NOT NULL,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    type ENUM('core', 'secondary', 'bonus') NOT NULL DEFAULT 'secondary',
    FOREIGN KEY (role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills_master(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_skill (role_id, skill_id)
);
```

### 11. search_history

Tracks candidate search history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| hr_id | INT | FOREIGN KEY | Reference to hr_users |
| candidate_id | INT | FOREIGN KEY | Reference to candidates |
| searched_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Search timestamp |
| previous_score | INT | NULL | Score before update |
| updated_score | INT | NULL | Score after update |

```sql
CREATE TABLE search_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hr_id INT NOT NULL,
    candidate_id INT NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_score INT,
    updated_score INT,
    FOREIGN KEY (hr_id) REFERENCES hr_users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);
```

## Sample Data

### Pre-approved HR Users
```sql
INSERT INTO preapproved_hr (email, status) VALUES
('hr@company.com', 'active'),
('recruiter@company.com', 'active'),
('admin@company.com', 'active');
```

### Job Roles
```sql
INSERT INTO job_roles (role_name, description) VALUES
('Frontend Developer', 'Responsible for UI/UX implementation'),
('Backend Developer', 'Server-side development and APIs'),
('Full Stack Developer', 'Both frontend and backend development'),
('DevOps Engineer', 'Infrastructure and deployment');
```

### Skills Master
```sql
INSERT INTO skills_master (skill_name, category) VALUES
('JavaScript', 'frontend'),
('TypeScript', 'frontend'),
('React', 'frontend'),
('Node.js', 'backend'),
('Python', 'backend'),
('Java', 'backend'),
('MySQL', 'database'),
('MongoDB', 'database'),
('Docker', 'devops'),
('AWS', 'devops');
```

### Skill Aliases
```sql
INSERT INTO skill_aliases (skill_id, alias) VALUES
(1, 'JS'), (1, 'javascript'), (1, 'java script'),
(3, 'React.js'), (3, 'reactjs'), (3, 'react js'),
(4, 'Node'), (4, 'nodejs'), (4, 'node.js'),
(5, 'Python3'), (5, 'python 3');
```

## Indexes

```sql
-- Performance indexes

CREATE INDEX idx_analysis_candidate ON analysis_results(candidate_id);
CREATE INDEX idx_analysis_decision ON analysis_results(decision);
CREATE INDEX idx_analysis_score ON analysis_results(score);
CREATE INDEX idx_search_history_hr ON search_history(hr_id);
CREATE INDEX idx_search_history_date ON search_history(searched_at);
```

## Relationships Summary

| Parent Table | Child Table | Relationship |
|--------------|-------------|--------------|
| hr_users | search_history | One-to-Many |
| hr_users | selected_candidates | One-to-Many |
| hr_users | rejected_candidates | One-to-Many |
| candidates | analysis_results | One-to-Many |
| candidates | selected_candidates | One-to-Many |
| candidates | rejected_candidates | One-to-Many |
| candidates | search_history | One-to-Many |
| job_roles | role_skills_mapping | One-to-Many |
| skills_master | skill_aliases | One-to-Many |
| skills_master | role_skills_mapping | One-to-Many |

## Database Configuration

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/github_analyzer?useSSL=false&serverTimezone=UTC
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect
```
