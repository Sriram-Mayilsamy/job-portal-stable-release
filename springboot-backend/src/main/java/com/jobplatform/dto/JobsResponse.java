package com.jobplatform.dto;

import com.jobplatform.entity.Job;
import java.util.List;

public class JobsResponse {
    private List<Job> jobs;
    private long total;
    private int page;
    private int limit;
    private int totalPages;

    // Constructors
    public JobsResponse() {}

    public JobsResponse(List<Job> jobs, long total, int page, int limit, int totalPages) {
        this.jobs = jobs;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = totalPages;
    }

    // Getters and Setters
    public List<Job> getJobs() { return jobs; }
    public void setJobs(List<Job> jobs) { this.jobs = jobs; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}