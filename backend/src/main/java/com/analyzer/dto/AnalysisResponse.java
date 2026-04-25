package com.analyzer.dto;

import java.util.List;
import java.util.Map;

public class AnalysisResponse {
    private Profile profile;
    private List<Repository> repositories;
    private Map<String, Integer> languages;
    private Activity activity;
    private Scores scores;
    private Evaluation evaluation;

    public static class Profile {
        private String login;
        private String name;
        private String avatarUrl;
        private String htmlUrl;
        private String bio;
        private int publicRepos;
        private int followers;
        private int following;
        private String createdAt;

        // Getters and Setters
        public String getLogin() { return login; }
        public void setLogin(String login) { this.login = login; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public String getHtmlUrl() { return htmlUrl; }
        public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public int getPublicRepos() { return publicRepos; }
        public void setPublicRepos(int publicRepos) { this.publicRepos = publicRepos; }
        public int getFollowers() { return followers; }
        public void setFollowers(int followers) { this.followers = followers; }
        public int getFollowing() { return following; }
        public void setFollowing(int following) { this.following = following; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class Repository {
        private String name;
        private String fullName;
        private String htmlUrl;
        private String description;
        private int stargazersCount;
        private int forksCount;
        private String language;
        private String updatedAt;
        private String createdAt;
        private int size;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getHtmlUrl() { return htmlUrl; }
        public void setHtmlUrl(String htmlUrl) { this.htmlUrl = htmlUrl; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public int getStargazersCount() { return stargazersCount; }
        public void setStargazersCount(int stargazersCount) { this.stargazersCount = stargazersCount; }
        public int getForksCount() { return forksCount; }
        public void setForksCount(int forksCount) { this.forksCount = forksCount; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }

    public static class Activity {
        private int totalCommits;
        private int lastYearCommits;
        private List<MonthlyCommit> monthlyCommits;
        private double avgCommitsPerMonth;

        public static class MonthlyCommit {
            private String month;
            private int commits;

            public String getMonth() { return month; }
            public void setMonth(String month) { this.month = month; }
            public int getCommits() { return commits; }
            public void setCommits(int commits) { this.commits = commits; }
        }

        // Getters and Setters
        public int getTotalCommits() { return totalCommits; }
        public void setTotalCommits(int totalCommits) { this.totalCommits = totalCommits; }
        public int getLastYearCommits() { return lastYearCommits; }
        public void setLastYearCommits(int lastYearCommits) { this.lastYearCommits = lastYearCommits; }
        public List<MonthlyCommit> getMonthlyCommits() { return monthlyCommits; }
        public void setMonthlyCommits(List<MonthlyCommit> monthlyCommits) { this.monthlyCommits = monthlyCommits; }
        public double getAvgCommitsPerMonth() { return avgCommitsPerMonth; }
        public void setAvgCommitsPerMonth(double avgCommitsPerMonth) { this.avgCommitsPerMonth = avgCommitsPerMonth; }
    }

    public static class Scores {
        private int activityScore;
        private int repoQuality;
        private int skillMatch;
        private int openSource;
        private int consistency;
        private int overallScore;

        // Getters and Setters
        public int getActivityScore() { return activityScore; }
        public void setActivityScore(int activityScore) { this.activityScore = activityScore; }
        public int getRepoQuality() { return repoQuality; }
        public void setRepoQuality(int repoQuality) { this.repoQuality = repoQuality; }
        public int getSkillMatch() { return skillMatch; }
        public void setSkillMatch(int skillMatch) { this.skillMatch = skillMatch; }
        public int getOpenSource() { return openSource; }
        public void setOpenSource(int openSource) { this.openSource = openSource; }
        public int getConsistency() { return consistency; }
        public void setConsistency(int consistency) { this.consistency = consistency; }
        public int getOverallScore() { return overallScore; }
        public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
    }

    public static class Evaluation {
        private String strengths;
        private String weaknesses;
        private String decision;

        // Getters and Setters
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        public String getWeaknesses() { return weaknesses; }
        public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
        public String getDecision() { return decision; }
        public void setDecision(String decision) { this.decision = decision; }
    }

    // Getters and Setters
    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }
    public List<Repository> getRepositories() { return repositories; }
    public void setRepositories(List<Repository> repositories) { this.repositories = repositories; }
    public Map<String, Integer> getLanguages() { return languages; }
    public void setLanguages(Map<String, Integer> languages) { this.languages = languages; }
    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }
    public Scores getScores() { return scores; }
    public void setScores(Scores scores) { this.scores = scores; }
    public Evaluation getEvaluation() { return evaluation; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }
}
