package com.jobplatform.dto;

import jakarta.validation.constraints.NotBlank;

public class ApplicationStatusUpdateRequest {
    @NotBlank
    private String status; // "applied", "approved", "rejected", "waitlisted"

    // Constructors
    public ApplicationStatusUpdateRequest() {}

    public ApplicationStatusUpdateRequest(String status) {
        this.status = status;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}