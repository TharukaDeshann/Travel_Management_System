import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { fetchLoggedInUser } from "../../services/authService";
import { useNotification } from "../../hooks/useNotification.jsx";

// Custom styled components
import {
  Container,
  Card,
  Title,
  Text,
  Button,
  Grid,
  Avatar,
  Badge,
  Separator,
  FlexContainer,
  SectionTitle
} from "../../components/StyledComponents";

// Profile Detail Item
const ProfileDetailItem = ({ label, value, icon }) => (
  <div style={{ marginBottom: "16px" }}>
    <Text size="14px" weight="500" color="#666" marginBottom="4px">
      {label}
    </Text>
    <FlexContainer alignItems="center" gap={8} marginBottom="0">
      {icon && <span className="profile-icon">{icon}</span>}
      <Text marginBottom="0">
        {value || <span style={{ color: "#999", fontStyle: "italic" }}>Not provided</span>}
      </Text>
    </FlexContainer>
  </div>
);

const UserProfile = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    document.title = "Your Profile";
    
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const userData = await fetchLoggedInUser();
        setUser(userData);
        setLoading(false);
      } catch (error) {
        showError("Failed to load user profile. Please try again.");
        setLoading(false);
      }
    };

    // If user is not already loaded, fetch it
    if (!user) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user, setUser, showError]);

  const handleUpdateProfile = () => {
    navigate("/profile/update");
  };

  const handleUpdateEmail = () => {
    navigate("/profile/update-email");
  };

  const handleUpdatePassword = () => {
    navigate("/profile/update-password");
  };

  const getUserInitials = () => {
    if (!user) return "";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div className="loading-spinner"></div>
          <Text size="16px" marginTop="16px">Loading your profile...</Text>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Title>User profile not available</Title>
          <Text>Please log in to view your profile</Text>
          <Button onClick={() => navigate("/login")} style={{ marginTop: "24px" }}>
            Login
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container width="900px">
      <Title>Your Profile</Title>
      
      <Card>
        <Grid columns={2}>
          <div style={{ textAlign: "center" }}>
            <Avatar size="120px" src={user.profileImage}>
              {getUserInitials()}
            </Avatar>
            <Title size="20px" marginTop="16px">
              {`${user.firstName} ${user.lastName}`}
            </Title>
            <Badge variant={user.verified ? "success" : "warning"}>
              {user.verified ? "Verified" : "Unverified"}
            </Badge>
            <Text size="16px" color="#666" marginTop="8px">
              {user.role}
            </Text>
          </div>
          
          <div>
            <SectionTitle>Basic Information</SectionTitle>
            <ProfileDetailItem 
              label="Email" 
              value={user.email} 
              icon="✉️" 
            />
            <ProfileDetailItem 
              label="Phone Number" 
              value={user.contactNumber} 
              icon="📱" 
            />
            <ProfileDetailItem 
              label="Address" 
              value={user.address} 
              icon="🏠" 
            />
          </div>
        </Grid>
        
        <Separator />
        
        {/* Role-specific information */}
        <SectionTitle>
          {user.role === "GUIDE" ? "Guide Information" : user.role === "TRAVELER" ? "Traveler Information" : "Additional Information"}
        </SectionTitle>
        
        {user.role === "GUIDE" && (
          <div>
            <ProfileDetailItem 
              label="About Me" 
              value={user.about} 
              icon="📝" 
            />
            
            <Text size="14px" weight="500" color="#666" marginBottom="4px">
              Languages
            </Text>
            <div style={{ marginBottom: "16px" }}>
              {user.languages ? (
                user.languages.split(',').map(lang => (
                  <Badge key={lang.trim()}>
                    {lang.trim()}
                  </Badge>
                ))
              ) : (
                <Text color="#999" style={{ fontStyle: "italic" }}>No languages specified</Text>
              )}
            </div>
            
            <ProfileDetailItem 
              label="Vehicle Availability" 
              value={user.vehicleAvailability ? "Available" : "Not Available"} 
              icon="🚗" 
            />
            
            <ProfileDetailItem 
              label="Expertise Region" 
              value={user.expertiseCityRegion} 
              icon="🗺️" 
            />
          </div>
        )}
        
        {user.role === "TRAVELER" && (
          <div>
            <ProfileDetailItem 
              label="Nationality" 
              value={user.nationality} 
              icon="🌍" 
            />
          </div>
        )}
        
        <Separator />
        
        <FlexContainer justifyContent="flex-end" gap={16}>
          <Button onClick={handleUpdateProfile}>
            Update Profile
          </Button>
          <Button onClick={handleUpdateEmail}>
            Update Email
          </Button>
          <Button onClick={handleUpdatePassword}>
            Update Password
          </Button>
        </FlexContainer>
      </Card>
    </Container>
  );
};

export default UserProfile;