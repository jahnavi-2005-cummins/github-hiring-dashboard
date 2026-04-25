package com.analyzer.dto;

import lombok.Data;

import java.util.List;

@Data
public class JobRoleRequest {
    private String roleName;
    private String description;
    private List<String> skills;
}
