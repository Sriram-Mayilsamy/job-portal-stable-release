package com.jobplatform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    private String jobId;

    @NotBlank
    @Column(nullable = false)
    private String employerId;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false)
    private String company;

    @NotBlank
    @Column(nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private String salaryRange;

    @ElementCollection
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Column(nullable = false)
    private String applicationDeadline; // ISO date string

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructors
    public Job() {}

    public Job(String jobId, String employerId, String title, String company, String location, 
               String description, String requirements, String salaryRange, List<String> skills, 
               String applicationDeadline) {
        this.jobId = jobId;
        this.employerId = employerId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.description = description;
        this.requirements = requirements;
        this.salaryRange = salaryRange;
        this.skills = skills;
        this.applicationDeadline = applicationDeadline;
    }

    // Getters and Setters
    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getEmployerId() { return employerId; }
    public void setEmployerId(String employerId) { this.employerId = employerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}