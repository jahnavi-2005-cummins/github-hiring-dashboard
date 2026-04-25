package com.analyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class GitHubApiService {

    private static final String GITHUB_API_BASE = "https://api.github.com";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GitHubApiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> getUserProfile(String username) throws Exception {
        String url = GITHUB_API_BASE + "/users/" + username;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "GitHub-Analyzer-App");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new Exception("User not found: " + username);
        }
        
        JsonNode userNode = objectMapper.readTree(response.getBody());
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("login", userNode.path("login").asText());
        profile.put("name", userNode.path("name").isTextual() ? userNode.path("name").asText() : userNode.path("login").asText());
        profile.put("avatar_url", userNode.path("avatar_url").asText());
        profile.put("html_url", userNode.path("html_url").asText());
        profile.put("bio", userNode.path("bio").isTextual() ? userNode.path("bio").asText("") : "");
        profile.put("public_repos", userNode.path("public_repos").asInt(0));
        profile.put("followers", userNode.path("followers").asInt(0));
        profile.put("following", userNode.path("following").asInt(0));
        profile.put("created_at", userNode.path("created_at").asText());
        
        return profile;
    }

    public List<Map<String, Object>> getUserRepositories(String username) throws Exception {
        String url = GITHUB_API_BASE + "/users/" + username + "/repos?sort=updated&per_page=100";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "GitHub-Analyzer-App");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        
        if (response.getStatusCode() != HttpStatus.OK) {
            return new ArrayList<>();
        }
        
        JsonNode reposNode = objectMapper.readTree(response.getBody());
        List<Map<String, Object>> repos = new ArrayList<>();
        
        for (JsonNode repo : reposNode) {
            Map<String, Object> repoData = new HashMap<>();
            repoData.put("name", repo.path("name").asText());
            repoData.put("full_name", repo.path("full_name").asText());
            repoData.put("html_url", repo.path("html_url").asText());
            repoData.put("description", repo.path("description").isTextual() ? repo.path("description").asText("") : "No description");
            repoData.put("stargazers_count", repo.path("stargazers_count").asInt(0));
            repoData.put("forks_count", repo.path("forks_count").asInt(0));
            repoData.put("language", repo.path("language").isTextual() ? repo.path("language").asText("") : null);
            repoData.put("updated_at", repo.path("updated_at").asText());
            repoData.put("created_at", repo.path("created_at").asText());
            repoData.put("size", repo.path("size").asInt(0));
            repos.add(repoData);
        }
        
        return repos;
    }

    public Map<String, Integer> getLanguageStats(String username, List<Map<String, Object>> repos) throws Exception {
        Map<String, Integer> languageStats = new HashMap<>();
        
        for (Map<String, Object> repo : repos) {
            String language = (String) repo.get("language");
            if (language != null && !language.isEmpty()) {
                languageStats.put(language, languageStats.getOrDefault(language, 0) + 1);
            }
        }
        
        return languageStats;
    }

    public Map<String, Object> getCommitActivity(String username) throws Exception {
        Map<String, Object> activityData = new HashMap<>();
        List<Map<String, Object>> weeklyCommits = new ArrayList<>();
        
        // Get user's contribution activity from repos
        String url = GITHUB_API_BASE + "/users/" + username + "/events/public?per_page=100";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "GitHub-Analyzer-App");
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        
        int totalCommits = 0;
        int lastYearCommits = 0;
        Map<String, Integer> monthlyCommits = new HashMap<>();
        
        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode eventsNode = objectMapper.readTree(response.getBody());
            LocalDate oneYearAgo = LocalDate.now().minusYears(1);
            
            for (JsonNode event : eventsNode) {
                String type = event.path("type").asText();
                if ("PushEvent".equals(type)) {
                    totalCommits++;
                    String createdAt = event.path("created_at").asText();
                    try {
                        ZonedDateTime eventDate = ZonedDateTime.parse(createdAt);
                        LocalDate eventLocalDate = eventDate.toLocalDate();
                        
                        if (eventLocalDate.isAfter(oneYearAgo)) {
                            lastYearCommits++;
                        }
                        
                        String monthKey = eventDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                        monthlyCommits.put(monthKey, monthlyCommits.getOrDefault(monthKey, 0) + 1);
                    } catch (Exception e) {
                        // Skip invalid dates
                    }
                }
            }
        }
        
        // Generate last 12 months data
        List<Map<String, Object>> last12Months = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusMonths(i);
            String monthKey = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String monthName = date.format(DateTimeFormatter.ofPattern("MMM"));
            int commits = monthlyCommits.getOrDefault(monthKey, 0);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("commits", commits);
            last12Months.add(monthData);
        }
        
        activityData.put("totalCommits", totalCommits);
        activityData.put("lastYearCommits", lastYearCommits);
        activityData.put("monthlyCommits", last12Months);
        activityData.put("avgCommitsPerMonth", lastYearCommits / 12.0);
        
        return activityData;
    }

    public Map<String, Object> analyzeReadme(String username, String repoName) throws Exception {
        Map<String, Object> readmeData = new HashMap<>();
        List<String> technologies = new ArrayList<>();
        
        try {
            String url = GITHUB_API_BASE + "/repos/" + username + "/" + repoName + "/readme";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/vnd.github.v3+json");
            headers.set("User-Agent", "GitHub-Analyzer-App");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode readmeNode = objectMapper.readTree(response.getBody());
                String content = readmeNode.path("content").asText("");
                String encoding = readmeNode.path("encoding").asText("");
                
                if ("base64".equals(encoding)) {
                    String decoded = new String(Base64.getDecoder().decode(content));
                    
                    // Extract technologies from README
                    technologies = extractTechnologies(decoded);
                }
            }
        } catch (Exception e) {
            // README not found or error
        }
        
        readmeData.put("technologies", technologies);
        return readmeData;
    }

    private List<String> extractTechnologies(String readmeContent) {
        List<String> technologies = new ArrayList<>();
        String content = readmeContent.toLowerCase();
        
        String[] techKeywords = {
            "react", "angular", "vue", "next.js", "nextjs", "svelte",
            "node.js", "nodejs", "express", "nestjs", "fastify",
            "python", "django", "flask", "fastapi",
            "java", "spring", "spring boot", "hibernate",
            "javascript", "typescript", "html", "css", "sass", "scss",
            "docker", "kubernetes", "aws", "azure", "gcp",
            "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
            "graphql", "rest api", "microservices",
            "git", "ci/cd", "jenkins", "github actions",
            "tailwind", "bootstrap", "material-ui", "chakra-ui",
            "tensorflow", "pytorch", "machine learning", "data science",
            "flutter", "react native", "ios", "android",
            "golang", "rust", "c++", "c#", ".net"
        };
        
        for (String tech : techKeywords) {
            if (content.contains(tech.toLowerCase())) {
                technologies.add(tech);
            }
        }
        
        return technologies;
    }

    public Map<String, Object> getFullAnalysis(String username) throws Exception {
        Map<String, Object> analysis = new HashMap<>();
        
        // Get user profile
        Map<String, Object> profile = getUserProfile(username);
        analysis.put("profile", profile);
        
        // Get repositories
        List<Map<String, Object>> repos = getUserRepositories(username);
        analysis.put("repositories", repos);
        
        // Get language stats
        Map<String, Integer> languageStats = getLanguageStats(username, repos);
        analysis.put("languages", languageStats);
        
        // Get commit activity
        Map<String, Object> activity = getCommitActivity(username);
        analysis.put("activity", activity);
        
        // Calculate scores
        Map<String, Object> scores = calculateScores(profile, repos, languageStats, activity);
        analysis.put("scores", scores);
        
        // Extract strengths and weaknesses
        Map<String, String> evaluation = evaluateCandidate(profile, repos, languageStats, activity, scores);
        analysis.put("evaluation", evaluation);
        
        return analysis;
    }

    private Map<String, Object> calculateScores(
        Map<String, Object> profile,
        List<Map<String, Object>> repos,
        Map<String, Integer> languageStats,
        Map<String, Object> activity
    ) {
        Map<String, Object> scores = new HashMap<>();
        
        // Activity Score (20%) - based on commits and recent activity
        int lastYearCommits = (int) activity.get("lastYearCommits");
        double activityScore = Math.min(100, (lastYearCommits / 5.0) * 100);
        if (lastYearCommits == 0) activityScore = 30;
        scores.put("activity_score", Math.round(activityScore));
        
        // Repository Quality Score (20%) - based on stars, forks, and repo count
        int totalStars = 0;
        int totalForks = 0;
        for (Map<String, Object> repo : repos) {
            totalStars += (int) repo.get("stargazers_count");
            totalForks += (int) repo.get("forks_count");
        }
        double repoQualityScore = Math.min(100, ((totalStars + totalForks) / 10.0) * 100);
        if (repos.size() > 0) {
            repoQualityScore += Math.min(20, repos.size() * 2);
        }
        scores.put("repo_quality", Math.round(Math.min(100, repoQualityScore)));
        
        // Skills Match (30%) - based on language diversity
        int languageCount = languageStats.size();
        double skillsScore = Math.min(100, languageCount * 15);
        if (languageCount >= 3) skillsScore += 20;
        if (languageCount >= 5) skillsScore += 15;
        scores.put("skill_match", Math.round(Math.min(100, skillsScore)));
        
        // Open Source Contribution (15%) - based on public repos and followers
        int publicRepos = (int) profile.get("public_repos");
        int followers = (int) profile.get("followers");
        double openSourceScore = Math.min(100, (publicRepos * 3) + (followers * 0.5));
        scores.put("open_source", Math.round(openSourceScore));
        
        // Consistency (15%) - based on commit distribution
        List<Map<String, Object>> monthlyCommits = (List<Map<String, Object>>) activity.get("monthlyCommits");
        double consistencyScore = calculateConsistency(monthlyCommits);
        scores.put("consistency", Math.round(consistencyScore));
        
        // Overall Score (weighted average)
        double overallScore = (
            ((double) (int) scores.get("skill_match") * 0.30) +
            ((double) (int) scores.get("activity_score") * 0.20) +
            ((double) (int) scores.get("repo_quality") * 0.20) +
            ((double) (int) scores.get("open_source") * 0.15) +
            ((double) (int) scores.get("consistency") * 0.15)
        );
        scores.put("overall_score", Math.round(overallScore));
        
        return scores;
    }

    private double calculateConsistency(List<Map<String, Object>> monthlyCommits) {
        if (monthlyCommits.isEmpty()) return 30;
        
        List<Integer> commits = new ArrayList<>();
        for (Map<String, Object> month : monthlyCommits) {
            commits.add((int) month.get("commits"));
        }
        
        // Calculate standard deviation
        double avg = commits.stream().mapToInt(Integer::intValue).average().orElse(0);
        double variance = commits.stream()
            .mapToDouble(c -> Math.pow(c - avg, 2))
            .average()
            .orElse(0);
        double stdDev = Math.sqrt(variance);
        
        // Lower stdDev = more consistent
        double consistencyScore = 100 - Math.min(70, stdDev * 10);
        
        // Bonus for having commits in most months
        long monthsWithCommits = commits.stream().filter(c -> c > 0).count();
        consistencyScore += (monthsWithCommits / 12.0) * 30;
        
        return Math.min(100, Math.max(0, consistencyScore));
    }

    private Map<String, String> evaluateCandidate(
        Map<String, Object> profile,
        List<Map<String, Object>> repos,
        Map<String, Integer> languageStats,
        Map<String, Object> activity,
        Map<String, Object> scores
    ) {
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        int publicRepos = (int) profile.get("public_repos");
        int followers = (int) profile.get("followers");
        int lastYearCommits = (int) activity.get("lastYearCommits");
        int totalStars = repos.stream().mapToInt(r -> (int) r.get("stargazers_count")).sum();
        
        // Strengths
        if (publicRepos >= 20) {
            strengths.add("Active GitHub presence with " + publicRepos + " public repositories");
        }
        if (followers >= 50) {
            strengths.add("Strong community recognition with " + followers + " followers");
        }
        if (lastYearCommits >= 100) {
            strengths.add("Highly active contributor with " + lastYearCommits + " commits in the last year");
        }
        if (totalStars >= 50) {
            strengths.add("Quality projects with " + totalStars + " total stars");
        }
        if (languageStats.size() >= 4) {
            strengths.add("Versatile developer proficient in " + languageStats.size() + " programming languages");
        }
        if ((int) scores.get("consistency") >= 70) {
            strengths.add("Consistent contribution pattern over time");
        }
        
        // Weaknesses
        if (publicRepos < 5) {
            weaknesses.add("Limited public portfolio with only " + publicRepos + " repositories");
        }
        if (followers < 10) {
            weaknesses.add("Low community engagement");
        }
        if (lastYearCommits < 20) {
            weaknesses.add("Low recent activity - only " + lastYearCommits + " commits in the last year");
        }
        if (languageStats.size() < 2) {
            weaknesses.add("Limited technology stack exposure");
        }
        if ((int) scores.get("consistency") < 40) {
            weaknesses.add("Inconsistent contribution pattern");
        }
        if (totalStars < 5 && publicRepos > 3) {
            weaknesses.add("Projects may need better visibility or quality improvements");
        }
        
        // Default messages if empty
        if (strengths.isEmpty()) {
            strengths.add("Shows potential for growth");
            strengths.add("Active GitHub account");
        }
        if (weaknesses.isEmpty()) {
            weaknesses.add("Could increase open source contributions");
            weaknesses.add("Consider adding more project documentation");
        }
        
        Map<String, String> evaluation = new HashMap<>();
        evaluation.put("strengths", String.join(", ", strengths));
        evaluation.put("weaknesses", String.join(", ", weaknesses));
        
        // Determine decision
        int overallScore = (int) scores.get("overall_score");
        String decision;
        if (overallScore >= 75) {
            decision = "selected";
        } else if (overallScore >= 50) {
            decision = "consider";
        } else {
            decision = "rejected";
        }
        evaluation.put("decision", decision);
        
        return evaluation;
    }
}
