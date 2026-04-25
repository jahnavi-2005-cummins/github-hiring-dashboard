package com.analyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    /** Exposed as "userId" in JSON for frontend compatibility. */
    @JsonProperty("userId")
    private Long id;
    private String name;
    private String email;
    private String role;
}
