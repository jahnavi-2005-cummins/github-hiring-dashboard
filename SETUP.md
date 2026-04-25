# Setup Guide - GitHub Dashboard Analyzer

This guide provides step-by-step instructions to set up and run the GitHub Dashboard Analyzer application.

## 📋 Prerequisites

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18.x or higher | https://nodejs.org/ |
| Java JDK | 17 or higher | https://adoptium.net/ |
| MySQL | 8.0 or higher | https://dev.mysql.com/downloads/ |
| Maven | 3.8 or higher | https://maven.apache.org/ |
| Git | Latest | https://git-scm.com/ |
| VS Code | Latest | https://code.visualstudio.com/ |

### Verification Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Java version
java --version

# Check Maven version
mvn --version

# Check MySQL version
mysql --version

# Check Git version
git --version
```

## 🗄️ Database Setup

### Step 1: Install MySQL

**Windows:**
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and follow the setup wizard
3. Set root password when prompted
4. Configure MySQL as a Windows Service

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE github_analyzer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional but recommended)
CREATE USER 'analyzer'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON github_analyzer.* TO 'analyzer'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### Step 3: Create Tables

Save the following SQL as `schema.sql` and execute:

```sql
USE github_analyzer;

-- Pre-approved HR users table
CREATE TABLE preapproved_hr (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR users table
CREATE TABLE hr_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr') NOT NULL DEFAULT 'hr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
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

-- Analysis results table
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

-- Selected candidates table
CREATE TABLE selected_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    hr_id INT NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (hr_id) REFERENCES hr_users(id) ON DELETE CASCADE
);

-- Rejected candidates table
CREATE TABLE rejected_candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    hr_id INT NOT NULL,
    rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (hr_id) REFERENCES hr_users(id) ON DELETE CASCADE
);

-- Job roles table
CREATE TABLE job_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills master table
CREATE TABLE skills_master (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('frontend', 'backend', 'database', 'devops', 'mobile', 'tools')
);

-- Skill aliases table
CREATE TABLE skill_aliases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    skill_id INT NOT NULL,
    alias VARCHAR(100) NOT NULL,
    FOREIGN KEY (skill_id) REFERENCES skills_master(id) ON DELETE CASCADE
);

-- Role skills mapping table
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

-- Search history table
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

-- Alerts table
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO preapproved_hr (email, status) VALUES
('hr@company.com', 'active'),
('recruiter@company.com', 'active'),
('admin@company.com', 'active');

INSERT INTO job_roles (role_name, description) VALUES
('Frontend Developer', 'Responsible for UI/UX implementation'),
('Backend Developer', 'Server-side development and APIs'),
('Full Stack Developer', 'Both frontend and backend development'),
('DevOps Engineer', 'Infrastructure and deployment');

-- Create indexes
CREATE INDEX idx_candidates_username ON candidates(github_username);
CREATE INDEX idx_analysis_candidate ON analysis_results(candidate_id);
CREATE INDEX idx_analysis_decision ON analysis_results(decision);
CREATE INDEX idx_analysis_score ON analysis_results(score);
```

Execute the schema:
```bash
mysql -u root -p < schema.sql
```

## 🖥️ Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GITHUB_API_URL=https://api.github.com
```

### Step 4: Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Step 5: Build for Production

```bash
npm run build
```

## ☕ Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Configure Database Connection

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/github_analyzer?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect

server:
  port: 8080

app:
  jwt:
    secret: your-very-secret-jwt-key-change-in-production
    expiration: 86400000  # 24 hours in milliseconds
  
  github:
    api-url: https://api.github.com
    # Optional: Add personal access token for higher rate limits
    # token: your_github_token
```

### Step 3: Configure JWT Secret

Generate a secure JWT secret:

```bash
# Using openssl
openssl rand -base64 64
```

Update the `app.jwt.secret` in application.yml with the generated value.

### Step 4: Build the Project

```bash
mvn clean install
```

### Step 5: Run the Application

```bash
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### Alternative: Run as JAR

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/github-analyzer-0.0.1-SNAPSHOT.jar
```

## 🔧 VS Code Setup

### Recommended Extensions

1. **Extension Pack for Java** (Microsoft)
2. **Spring Boot Extension Pack** (VMware)
3. **ESLint** (Microsoft)
4. **Prettier** (Prettier)
5. **Tailwind CSS IntelliSense** (Brad Cornes)
6. **MySQL** (Jun Han)
7. **REST Client** (Huachao Mao)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.server.launchMode": "Standard",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

## 🌐 GitHub API Configuration

### Rate Limits

- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

### Getting GitHub Token (Optional)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes: `repo`, `user`
4. Copy the token
5. Add to `application.yml`:
   ```yaml
   app:
     github:
       token: your_token_here
   ```

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

### Backend Tests

```bash
cd backend
mvn test
```

### API Testing

Use the REST Client extension or tools like Postman:

```http
### Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "hr@company.com",
  "password": "password123"
}

### Analyze Candidate
POST http://localhost:8080/api/candidates/analyze
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "githubUsername": "johndoe",
  "jobRoleId": 1
}

### Get Dashboard Stats
GET http://localhost:8080/api/dashboard/stats
Authorization: Bearer <your_token>
```

## 🔐 Default Credentials

After setup, you can create an admin user:

```sql
-- Insert admin user (password is hashed BCrypt of 'admin123')
INSERT INTO hr_users (name, email, password, role) VALUES
('Admin User', 'admin@company.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lqkkO9QS3TzCjV3rS', 'admin');
```

## 🐛 Troubleshooting

### Common Issues

**1. MySQL Connection Error**
```
Solution: Verify MySQL is running and credentials are correct
mysql -u root -p
```

**2. Port Already in Use**
```
Solution: Change port in application.yml
server:
  port: 8081
```

**3. npm Install Fails**
```
Solution: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**4. Java Version Mismatch**
```
Solution: Ensure Java 17+ is installed
java --version
```

**5. CORS Error**
```
Solution: Check CORS configuration in SecurityConfig.java
```

## 📱 Running in Production

### Frontend

```bash
npm run build
# Deploy dist/ folder to web server
```

### Backend

```bash
mvn clean package
java -jar target/github-analyzer-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod
```

### Environment Variables for Production

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/github_analyzer
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export APP_JWT_SECRET=production_secret_key
```

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## 🎉 Verification

After completing all setup steps, verify:

1. ✅ Frontend accessible at http://localhost:5173
2. ✅ Backend accessible at http://localhost:8080
3. ✅ Database connected successfully
4. ✅ Login page loads correctly
5. ✅ Can analyze a GitHub profile

Congratulations! Your GitHub Dashboard Analyzer is ready to use! 🚀
