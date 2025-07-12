package com.yamu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserSearchResult {
    private String id;
    
    @JsonProperty("user_id")
    private int userId;
    
    private String role;
    
    @JsonProperty("first_name")
    private String firstName;
    
    @JsonProperty("last_name")
    private String lastName;
    
    private String email;
    private String address;
    
    @JsonProperty("contact_number")
    private String contactNumber;
    
    @JsonProperty("profile_image_url")
    private String profileImageUrl;
    
    @JsonProperty("is_verified")
    private boolean isVerified;
    
    private String nationality;
    
    @JsonProperty("guide_about")
    private String guideAbout;
    
    @JsonProperty("expertise_city_region")
    private String expertiseCityRegion;
    
    @JsonProperty("guide_language")
    private String guideLanguage;
    
    // Default constructor
    public UserSearchResult() {}
    
    // Constructor with all fields
    public UserSearchResult(String id, int userId, String role, String firstName, String lastName, 
                           String email, String address, String contactNumber, String profileImageUrl, 
                           boolean isVerified, String nationality, String guideAbout, 
                           String expertiseCityRegion, String guideLanguage) {
        this.id = id;
        this.userId = userId;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.contactNumber = contactNumber;
        this.profileImageUrl = profileImageUrl;
        this.isVerified = isVerified;
        this.nationality = nationality;
        this.guideAbout = guideAbout;
        this.expertiseCityRegion = expertiseCityRegion;
        this.guideLanguage = guideLanguage;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getContactNumber() {
        return contactNumber;
    }
    
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
    
    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    
    public boolean isVerified() {
        return isVerified;
    }
    
    public void setVerified(boolean verified) {
        isVerified = verified;
    }
    
    public String getNationality() {
        return nationality;
    }
    
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }
    
    public String getGuideAbout() {
        return guideAbout;
    }
    
    public void setGuideAbout(String guideAbout) {
        this.guideAbout = guideAbout;
    }
    
    public String getExpertiseCityRegion() {
        return expertiseCityRegion;
    }
    
    public void setExpertiseCityRegion(String expertiseCityRegion) {
        this.expertiseCityRegion = expertiseCityRegion;
    }
    
    public String getGuideLanguage() {
        return guideLanguage;
    }
    
    public void setGuideLanguage(String guideLanguage) {
        this.guideLanguage = guideLanguage;
    }
    
    // Utility method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    // Override toString for debugging
    @Override
    public String toString() {
        return "UserSearchResult{" +
                "id='" + id + '\'' +
                ", userId=" + userId +
                ", role='" + role + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", isVerified=" + isVerified +
                ", nationality='" + nationality + '\'' +
                ", expertiseCityRegion='" + expertiseCityRegion + '\'' +
                '}';
    }
}