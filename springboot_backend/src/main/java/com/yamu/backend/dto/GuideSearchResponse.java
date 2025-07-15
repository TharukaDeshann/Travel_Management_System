package com.yamu.backend.dto;

import java.util.List;
import java.util.Map;

public class GuideSearchResponse {
    private long totalCount;
    private List<GuideSearchResult> results;
    private int page;
    private int size;
    private boolean hasMore;
    private Map<String, List<String>> facets;
    
    // Constructors
    public GuideSearchResponse() {}
    
    public GuideSearchResponse(long totalCount, List<GuideSearchResult> results, int page, int size) {
        this.totalCount = totalCount;
        this.results = results;
        this.page = page;
        this.size = size;
        this.hasMore = (page + 1) * size < totalCount;
    }
    
    // Getters and Setters
    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
    
    public List<GuideSearchResult> getResults() { return results; }
    public void setResults(List<GuideSearchResult> results) { this.results = results; }
    
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    
    public boolean isHasMore() { return hasMore; }
    public void setHasMore(boolean hasMore) { this.hasMore = hasMore; }
    
    public Map<String, List<String>> getFacets() { return facets; }
    public void setFacets(Map<String, List<String>> facets) { this.facets = facets; }
    
    public void calculateHasMore() {
        this.hasMore = (page + 1) * size < totalCount;
    }
}