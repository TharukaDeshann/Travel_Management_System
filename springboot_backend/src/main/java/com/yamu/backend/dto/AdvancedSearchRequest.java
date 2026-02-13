package com.yamu.backend.dto;

import java.util.List;

// Inner classes for request/response DTOs
    public  class AdvancedSearchRequest {
        private String query;
        private List<String> regions;
        private List<String> languages;
        private List<String> vehicleTypes;
        private Integer minCapacity;
        private Integer maxCapacity;
        private Boolean airConditioned;
        private Boolean verified;
        private Integer minRating;
        private Double minPrice;
        private Double maxPrice;
        private List<String> reservationStatuses;
        private String dateRangeStart;
        private String dateRangeEnd;
        private String orderBy;
        private List<String> facets;
        private int page = 0;
        private int size = 10;
        
        // Getters and setters
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        
        public List<String> getRegions() { return regions; }
        public void setRegions(List<String> regions) { this.regions = regions; }
        
        public List<String> getLanguages() { return languages; }
        public void setLanguages(List<String> languages) { this.languages = languages; }
        
        public List<String> getVehicleTypes() { return vehicleTypes; }
        public void setVehicleTypes(List<String> vehicleTypes) { this.vehicleTypes = vehicleTypes; }
        
        public Integer getMinCapacity() { return minCapacity; }
        public void setMinCapacity(Integer minCapacity) { this.minCapacity = minCapacity; }
        
        public Integer getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
        
        public Boolean getAirConditioned() { return airConditioned; }
        public void setAirConditioned(Boolean airConditioned) { this.airConditioned = airConditioned; }
        
        public Boolean getVerified() { return verified; }
        public void setVerified(Boolean verified) { this.verified = verified; }
        
        public Integer getMinRating() { return minRating; }
        public void setMinRating(Integer minRating) { this.minRating = minRating; }
        
        public Double getMinPrice() { return minPrice; }
        public void setMinPrice(Double minPrice) { this.minPrice = minPrice; }
        
        public Double getMaxPrice() { return maxPrice; }
        public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }
        
        public List<String> getReservationStatuses() { return reservationStatuses; }
        public void setReservationStatuses(List<String> reservationStatuses) { this.reservationStatuses = reservationStatuses; }
        
        public String getDateRangeStart() { return dateRangeStart; }
        public void setDateRangeStart(String dateRangeStart) { this.dateRangeStart = dateRangeStart; }
        
        public String getDateRangeEnd() { return dateRangeEnd; }
        public void setDateRangeEnd(String dateRangeEnd) { this.dateRangeEnd = dateRangeEnd; }
        
        public String getOrderBy() { return orderBy; }
        public void setOrderBy(String orderBy) { this.orderBy = orderBy; }
        
        public List<String> getFacets() { return facets; }
        public void setFacets(List<String> facets) { this.facets = facets; }
        
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }
