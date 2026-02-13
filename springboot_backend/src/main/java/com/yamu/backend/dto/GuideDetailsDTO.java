package com.yamu.backend.dto;

import com.yamu.backend.model.Guide;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuideDetailsDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String contactNumber;
    private String expertiseCityRegion;
    private String language;
    private String about;
    private boolean vehicleAvailability;
    private String profileImageUrl;

    public static GuideDetailsDTO fromGuide(Guide guide) {
        return new GuideDetailsDTO(
                guide.getId(),
                guide.getFirstName(),
                guide.getLastName(),
                guide.getEmail(),
                guide.getContactNumber(),
                guide.getExpertiseCityRegion(),
                guide.getLanguage(),
                guide.getAbout(),
                guide.isVehicleAvailability(),
                guide.getProfileImageUrl()
        );
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
