package com.jobplatform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String userId;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Column(nullable = false)
    private String role; // "admin", "employer", "jobseeker"

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    private String company; // For employers

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors
    public User() {}

    public User(String userId, String email, String password, String role, String fullName, String company) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.role = role;
        this.fullName = fullName;
        this.company = company;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}