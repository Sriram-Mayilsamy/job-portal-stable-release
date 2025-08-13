package com.jobplatform.dto;

public class UserResponse {
    private String userId;
    private String email;
    private String role;
    private String fullName;
    private String company;

    // Constructors
    public UserResponse() {}

    public UserResponse(String userId, String email, String role, String fullName, String company) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.company = company;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}