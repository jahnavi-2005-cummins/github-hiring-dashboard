# 🚀 Backend Setup Guide — Spring Boot + MySQL

This guide will get the **GitHub Analyzer backend** running on your machine in VS Code.

---

## ✅ Prerequisites

Install these BEFORE you start:

| Software | Version | Download |
|----------|---------|----------|
| **Java JDK** | 17 or higher | https://adoptium.net/ |
| **Maven** | 3.6+ | https://maven.apache.org/download.cgi |
| **MySQL** | 8.0+ | https://dev.mysql.com/downloads/mysql/ |
| **VS Code** | latest | https://code.visualstudio.com/ |

### VS Code Extensions (install these)
1. **Extension Pack for Java** (Microsoft)
2. **Spring Boot Extension Pack** (VMware)
3. **Maven for Java** (Microsoft)

### Verify installations
Open CMD/Terminal and run:
```cmd
java -version
mvn -version
mysql --version
```
All three should print version numbers. If any says "not recognized", that tool isn't installed properly.

---

## 🗄️ Step 1: Setup MySQL Database

### Option A: Auto-create (Easiest — RECOMMENDED)
The backend will **automatically create** the database `github_analyzer` for you on first run, thanks to `createDatabaseIfNotExist=true` in the config.

**You only need to:**
1. Make sure MySQL server is running
2. Know your MySQL **root password**

### Option B: Manual create
If auto-create doesn't work, open MySQL Workbench or CMD:
```sql
CREATE DATABASE github_analyzer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### How to start MySQL on Windows
```cmd
net start MySQL80
```
(Replace `MySQL80` with whatever your service is named — check `services.msc`)

---

## ⚙️ Step 2: Configure Database Password

Open `backend/src/main/resources/application.yml` and change ONLY the password line:

```yaml
spring:
  datasource:
    username: root
    password: YOUR_MYSQL_PASSWORD_HERE   # <-- change this
```

**OR** (better) set environment variables in your terminal before running:
```cmd
set DB_PASSWORD=your_password
set DB_USERNAME=root
```

---

## 🏃 Step 3: Run the Backend

### Option A: From VS Code (Easiest)
1. Open the **`backend`** folder in VS Code (`File → Open Folder → backend`)
2. Wait for Java extensions to load (bottom-right shows "Java: ready")
3. Open `GitHubAnalyzerApplication.java`
4. Click the **▶ Run** button above the `main` method
5. Look for: `Started GitHubAnalyzerApplication in X seconds`

### Option B: From Command Line
```cmd
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### ✅ Success looks like:
```
[Seeder] Pre-approved: admin@company.com
[Seeder] Pre-approved: hr@company.com
[Seeder] Default admin created: admin@company.com / admin123
[Seeder] Job role created: Frontend Developer
...
Tomcat started on port(s): 8080 (http) with context path ''
Started GitHubAnalyzerApplication in 5.234 seconds
```

### Test it
Open browser → http://localhost:8080/api/job-roles

You should see JSON with the 6 default job roles. ✅

---

## 🎨 Step 4: Run the Frontend

In **another terminal** (keep backend running):

```cmd
cd <project-root>
npm install
npm run dev
```

Then open http://localhost:5173

---

## 🔐 Default Login Credentials

After backend starts, you can log in with:

| Email | Password | Role |
|-------|----------|------|
| `admin@company.com` | `admin123` | Admin |

OR sign up a new HR user using any of these pre-approved emails:
- `hr@company.com`
- `hr1@company.com`
- `hr2@company.com`
- `test@company.com`
- `demo@company.com`

(Pick a password of 6+ characters during signup.)

---

## 🔥 Common Errors & Fixes

### ❌ `Communications link failure` / `Connection refused`
**Cause:** MySQL is not running or wrong port.
**Fix:**
```cmd
net start MySQL80
```
Or check MySQL is listening on port 3306:
```cmd
netstat -ano | findstr 3306
```

---

### ❌ `Access denied for user 'root'@'localhost'`
**Cause:** Wrong MySQL password.
**Fix:** Edit `backend/src/main/resources/application.yml` → set the correct password.

To reset MySQL root password:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
```

---

### ❌ `Public Key Retrieval is not allowed`
**Cause:** MySQL 8 authentication.
**Fix:** Already handled — the URL has `allowPublicKeyRetrieval=true`. If you still see it, run:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpass';
```

---

### ❌ `Port 8080 already in use`
**Fix:** Either kill the process or change port:
```cmd
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```
Or change `server.port` in `application.yml` to `8081` and update frontend `.env` accordingly.

---

### ❌ `Unknown database 'github_analyzer'`
**Cause:** `createDatabaseIfNotExist` didn't trigger (unusual).
**Fix:** Manually create:
```sql
CREATE DATABASE github_analyzer;
```

---

### ❌ `JAVA_HOME not set` or `mvn not recognized`
**Fix:**
1. Install JDK 17 from https://adoptium.net/
2. Set environment variable:
   - Win + R → `sysdm.cpl` → Advanced → Environment Variables
   - Add `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17`
   - Add `%JAVA_HOME%\bin` to `PATH`
3. Restart CMD/VS Code

---

### ❌ Frontend says "Failed to fetch"
**Cause:** Backend not running or wrong API URL.
**Fix:**
1. Confirm backend is running: open http://localhost:8080/api/job-roles in browser
2. Check `.env` in project root has: `VITE_API_URL=http://localhost:8080/api`
3. Restart `npm run dev` after changing `.env`

---

### ❌ `LazyInitializationException`
Already fixed — `spring.jpa.open-in-view: true` is enabled and read endpoints use `@Transactional(readOnly=true)`.

---

### ❌ Compilation errors about Lombok (`getter not found`, etc.)
**Fix:** Install Lombok plugin in VS Code:
1. Extension Pack for Java handles this automatically
2. If issues persist: `Ctrl+Shift+P` → "Java: Clean Java Language Server Workspace" → Restart

---

## 📊 Verify Database Tables Were Created

Open MySQL Workbench → connect → run:
```sql
USE github_analyzer;
SHOW TABLES;
```

You should see 11 tables:
- `analysis_results`
- `candidates`
- `hr_users`
- `job_roles`
- `preapproved_hr`
- `rejected_candidates`
- `role_skills_mapping`
- `search_history`
- `selected_candidates`
- `skill_aliases`
- `skills_master`

Check seeded data:
```sql
SELECT * FROM preapproved_hr;
SELECT * FROM hr_users;
SELECT * FROM job_roles;
SELECT jr.role_name, sm.skill_name
FROM role_skills_mapping rsm
JOIN job_roles jr ON jr.id = rsm.role_id
JOIN skills_master sm ON sm.id = rsm.skill_id
ORDER BY jr.role_name;
```

---

## 🧪 Test API Endpoints (Optional)

Use **Postman** or **Thunder Client** (VS Code extension):

### 1. Signup
```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
  "name": "Test HR",
  "email": "hr@company.com",
  "password": "password123"
}
```

### 2. Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

### 3. List Job Roles
```
GET http://localhost:8080/api/job-roles
```

### 4. Dashboard Stats
```
GET http://localhost:8080/api/stats/dashboard
```

---

## 🎯 Final Checklist

Before reporting issues, verify:

- [ ] Java 17+ installed (`java -version`)
- [ ] Maven installed (`mvn -version`)
- [ ] MySQL running (`net start MySQL80`)
- [ ] Correct password in `application.yml`
- [ ] Backend logs show "Started GitHubAnalyzerApplication"
- [ ] http://localhost:8080/api/job-roles returns JSON
- [ ] `.env` file in project root has `VITE_API_URL=http://localhost:8080/api`
- [ ] Frontend dev server running (`npm run dev`)

---

## 🆘 Still Stuck?

Copy the **full backend startup log** (from `mvn spring-boot:run`) — the last 20 lines tell you exactly what failed (DB connection, compile error, port conflict, etc.).
