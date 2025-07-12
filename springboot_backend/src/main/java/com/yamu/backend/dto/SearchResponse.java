package com.yamu.backend.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchResponse {
    private long totalCount;
    private List<UserSearchResult> results;
    private int page;
    private int size;
    private boolean hasMore;
    
    // Default constructor
    public SearchResponse() {}
    
    // Constructor with all fields
    public SearchResponse(long totalCount, List<UserSearchResult> results, int page, int size) {
        this.totalCount = totalCount;
        this.results = results;
        this.page = page;
        this.size = size;
        this.hasMore = (page + 1) * size < totalCount;
    }
    
    // Getters and Setters
    public long getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }
    
    public List<UserSearchResult> getResults() {
        return results;
    }
    
    public void setResults(List<UserSearchResult> results) {
        this.results = results;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public boolean isHasMore() {
        return hasMore;
    }
    
    public void setHasMore(boolean hasMore) {
        this.hasMore = hasMore;
    }
    
    // Helper method to calculate if there are more results
    public void calculateHasMore() {
        this.hasMore = (page + 1) * size < totalCount;
    }
}