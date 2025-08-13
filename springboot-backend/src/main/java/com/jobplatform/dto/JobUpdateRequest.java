package com.jobplatform.dto;

import java.util.List;

public class JobUpdateRequest {
    private String title;
    private String company;
    private String location;
    private String description;
    private String requirements;
    private String salaryRange;
    private List<String> skills;
    private String applicationDeadline; // ISO date string

    // Constructors
    public JobUpdateRequest() {}

    public JobUpdateRequest(String title, String company, String location, String description, 
                           String requirements, String salaryRange, List<String> skills, String applicationDeadline) {
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
}