package com.analyzer.dto;

import lombok.Data;

import java.util.List;

@Data
public class SaveAnalysisRequest {
    private String githubUsername;
    private String name;
    private String avatarUrl;
    private String profileUrl;
    private Integer publicRepos;
    private Integer followers;
    private Integer following;

    private Integer score;
    private Double skillMatch;
    private Double activityScore;
    private Double repoQuality;
    private Double openSource;
    private Double consistency;
    private List<String> strengths;
    private List<String> weaknesses;
    private String decision; // SELECTED, CONSIDER, REJECTED
    private String roleName;
    private Long hrId;
}
