package com.analyzer.dto;

import lombok.Data;

@Data
public class DecisionRequest {
    private String githubUsername;
    private String decision; // SELECTED, CONSIDER, REJECTED
    private Long hrId;
}
