package com.yamu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;


public class GuideSearchResult {
    @JsonProperty("search_key")
    private String searchKey;
    
    @JsonProperty("guide_id")
    private String guideId;
    
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
    
    @JsonProperty("guide_about")
    private String guideAbout;
    
    @JsonProperty("expertise_city_region")
    private String expertiseCityRegion;
    
    @JsonProperty("guide_language")
    private String guideLanguage;
    
    // Vehicle details
    @JsonProperty("vehicle_id")
    private String vehicleId;
    
    @JsonProperty("vehicle_model")
    private String vehicleModel;
    
    @JsonProperty("vehicle_type")
    private String vehicleType;
    
    @JsonProperty("vehicle_capacity")
    private Integer vehicleCapacity;
    
    @JsonProperty("vehicle_air_conditioned")
    private Boolean vehicleAirConditioned;
    
    @JsonProperty("vehicle_available")
    private Boolean vehicleAvailable;
    
    @JsonProperty("vehicle_image_url")
    private String vehicleImageUrl;
    
    // Review details
    @JsonProperty("review_id")
    private String reviewId;
    
    @JsonProperty("review_comment")
    private String reviewComment;
    
    @JsonProperty("review_rating")
    private Integer reviewRating;
    
    @JsonProperty("review_created_at")
    private LocalDateTime reviewCreatedAt;
    
    @JsonProperty("reviewer_id")
    private String reviewerId;
    
    // Reservation details
    @JsonProperty("reservation_id")
    private String reservationId;
    
    @JsonProperty("reservation_status")
    private String reservationStatus;
    
    @JsonProperty("number_of_days")
    private Integer numberOfDays;
    
    @JsonProperty("estimated_price")
    private Double estimatedPrice;
    
    @JsonProperty("reservation_places")
    private String reservationPlaces;
    
    @JsonProperty("reservation_dates")
    private String reservationDates;
    
    @JsonProperty("max_travelers")
    private Integer maxTravelers;
    
    // Aggregated statistics
    @JsonProperty("total_vehicles")
    private Integer totalVehicles;
    
    @JsonProperty("total_reviews")
    private Integer totalReviews;
    
    @JsonProperty("average_rating")
    private Double averageRating;
    
    @JsonProperty("total_reservations")
    private Integer totalReservations;
    
    @JsonProperty("completed_reservations")
    private Integer completedReservations;
    
    @JsonProperty("confirmed_reservations")
    private Integer confirmedReservations;
    
    @JsonProperty("pending_reservations")
    private Integer pendingReservations;
    
    // Constructors
    public GuideSearchResult() {}
    
    // Getters and Setters (all fields)
    public String getSearchKey() { return searchKey; }
    public void setSearchKey(String searchKey) { this.searchKey = searchKey; }
    
    public String getGuideId() { return guideId; }
    public void setGuideId(String guideId) { this.guideId = guideId; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    
    public String getGuideAbout() { return guideAbout; }
    public void setGuideAbout(String guideAbout) { this.guideAbout = guideAbout; }
    
    public String getExpertiseCityRegion() { return expertiseCityRegion; }
    public void setExpertiseCityRegion(String expertiseCityRegion) { this.expertiseCityRegion = expertiseCityRegion; }
    
    public String getGuideLanguage() { return guideLanguage; }
    public void setGuideLanguage(String guideLanguage) { this.guideLanguage = guideLanguage; }
    
    // Vehicle getters/setters
    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }
    
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    
    public Integer getVehicleCapacity() { return vehicleCapacity; }
    public void setVehicleCapacity(Integer vehicleCapacity) { this.vehicleCapacity = vehicleCapacity; }
    
    public Boolean getVehicleAirConditioned() { return vehicleAirConditioned; }
    public void setVehicleAirConditioned(Boolean vehicleAirConditioned) { this.vehicleAirConditioned = vehicleAirConditioned; }
    
    public Boolean getVehicleAvailable() { return vehicleAvailable; }
    public void setVehicleAvailable(Boolean vehicleAvailable) { this.vehicleAvailable = vehicleAvailable; }
    
    public String getVehicleImageUrl() { return vehicleImageUrl; }
    public void setVehicleImageUrl(String vehicleImageUrl) { this.vehicleImageUrl = vehicleImageUrl; }
    
    // Review getters/setters
    public String getReviewId() { return reviewId; }
    public void setReviewId(String reviewId) { this.reviewId = reviewId; }
    
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
    
    public Integer getReviewRating() { return reviewRating; }
    public void setReviewRating(Integer reviewRating) { this.reviewRating = reviewRating; }
    
    public LocalDateTime getReviewCreatedAt() { return reviewCreatedAt; }
    public void setReviewCreatedAt(LocalDateTime reviewCreatedAt) { this.reviewCreatedAt = reviewCreatedAt; }
    
    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }
    
    // Reservation getters/setters
    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }
    
    public String getReservationStatus() { return reservationStatus; }
    public void setReservationStatus(String reservationStatus) { this.reservationStatus = reservationStatus; }
    
    public Integer getNumberOfDays() { return numberOfDays; }
    public void setNumberOfDays(Integer numberOfDays) { this.numberOfDays = numberOfDays; }
    
    public Double getEstimatedPrice() { return estimatedPrice; }
    public void setEstimatedPrice(Double estimatedPrice) { this.estimatedPrice = estimatedPrice; }
    
    public String getReservationPlaces() { return reservationPlaces; }
    public void setReservationPlaces(String reservationPlaces) { this.reservationPlaces = reservationPlaces; }
    
    public String getReservationDates() { return reservationDates; }
    public void setReservationDates(String reservationDates) { this.reservationDates = reservationDates; }
    
    public Integer getMaxTravelers() { return maxTravelers; }
    public void setMaxTravelers(Integer maxTravelers) { this.maxTravelers = maxTravelers; }
    
    // Aggregated statistics getters/setters
    public Integer getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(Integer totalVehicles) { this.totalVehicles = totalVehicles; }
    
    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getTotalReservations() { return totalReservations; }
    public void setTotalReservations(Integer totalReservations) { this.totalReservations = totalReservations; }
    
    public Integer getCompletedReservations() { return completedReservations; }
    public void setCompletedReservations(Integer completedReservations) { this.completedReservations = completedReservations; }
    
    public Integer getConfirmedReservations() { return confirmedReservations; }
    public void setConfirmedReservations(Integer confirmedReservations) { this.confirmedReservations = confirmedReservations; }
    
    public Integer getPendingReservations() { return pendingReservations; }
    public void setPendingReservations(Integer pendingReservations) { this.pendingReservations = pendingReservations; }
    
    // Utility methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean hasVehicle() {
        return vehicleId != null && !vehicleId.isEmpty();
    }
    
    public boolean hasReviews() {
        return totalReviews != null && totalReviews > 0;
    }
    
    public boolean hasReservations() {
        return totalReservations != null && totalReservations > 0;
    }
}