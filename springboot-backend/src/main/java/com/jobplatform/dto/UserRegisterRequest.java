package com.jobplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserRegisterRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role; // "employer" or "jobseeker"

    @NotBlank
    private String fullName;

    private String company; // For employers

    // Constructors
    public UserRegisterRequest() {}

    public UserRegisterRequest(String email, String password, String role, String fullName, String company) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.company = company;
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}