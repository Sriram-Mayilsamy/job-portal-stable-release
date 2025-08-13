package com.jobplatform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    private String applicationId;

    @NotBlank
    @Column(nullable = false)
    private String jobId;

    @NotBlank
    @Column(nullable = false)
    private String applicantId;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    @Email
    @Column(nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private String resumeFilename;

    @NotBlank
    @Column(nullable = false)
    private String status; // "applied", "approved", "rejected", "waitlisted"

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors
    public Application() {}

    public Application(String applicationId, String jobId, String applicantId, String fullName, 
                      String email, String phone, String coverLetter, String resumeFilename, String status) {
        this.applicationId = applicationId;
        this.jobId = jobId;
        this.applicantId = applicantId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.coverLetter = coverLetter;
        this.resumeFilename = resumeFilename;
        this.status = status;
    }

    // Getters and Setters
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getApplicantId() { return applicantId; }
    public void setApplicantId(String applicantId) { this.applicantId = applicantId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}