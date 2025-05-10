import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { fetchLoggedInUser, logoutUser } from "../../services/authService";
import { useNotification } from "../../hooks/useNotification.jsx";
import styled from "styled-components";
import apiClient from "../../services/axiosInstance.js"

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

// Profile Detail Item - Styled component approach instead of inline styles
const DetailLabel = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
`;

const DetailContainer = styled.div`
  margin-bottom: 16px;
`;

const IconWrapper = styled.span`
  margin-right: 8px;
`;

const DetailValue = styled(Text)`
  margin-bottom: 0;
`;

const NotProvidedText = styled.span`
  color: #999;
  font-style: italic;
`;

// Profile Detail Item component
const ProfileDetailItem = ({ label, value, icon }) => (
  <DetailContainer>
    <DetailLabel>{label}</DetailLabel>
    <FlexContainer gap={8}>
      {icon && <IconWrapper className="profile-icon">{icon}</IconWrapper>}
      <DetailValue>
        {value || <NotProvidedText>Not provided</NotProvidedText>}
      </DetailValue>
    </FlexContainer>
  </DetailContainer>
);

const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

const BadgeContainer = styled.div`
  margin-bottom: 16px;
`;

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null); // Safe to use here
      navigate("/login");
    } catch (error) {
      showError("Logout failed. Please try again.");
    }
  };
  const [selectedImage, setSelectedImage] = useState(null);

const handleImageChange = (e) => {
  setSelectedImage(e.target.files[0]);
};

const handleImageUpload = async () => {
  if (!selectedImage) return showError("Please select an image.");

  const formData = new FormData();
  formData.append("image", selectedImage);

  try {
    const response = await apiClient.post(`/api/users/${user.id}/upload-profile-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const updatedImage = response.data.imageUrl;
    setUser({ ...user, profileImage: updatedImage });
    showSuccess("Profile image updated successfully!");
  } catch (err) {
    showError("Image upload failed. Please try again.");
  }
};

  

  const getUserInitials = () => {
    if (!user) return "";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <div className="loading-spinner"></div>
          <Text size="16px">Loading your profile...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <LoadingContainer>
          <Title>User profile not available</Title>
          <Text>Please log in to view your profile</Text>
          <Button onClick={() => navigate("/login")}>
            Login
          </Button>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container width="900px">
      <Title>Your Profile</Title>
      
      <Card>
        <Grid columns={2}>
          <div>
            <Avatar size="120px" src={user.profileImage}>
              {getUserInitials()}
            </Avatar>
            <Title size="20px">
              {`${user.firstName} ${user.lastName}`}
            </Title>
            <Badge variant={user.verified ? "success" : "warning"}>
              {user.verified ? "Verified" : "Unverified"}
            </Badge>
            <Text size="16px" color="#666">
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
            
            <DetailLabel>Languages</DetailLabel>
            <BadgeContainer>
              {user.language ? (
                user.language.split(',').map(lang => (
                  <Badge key={lang.trim()}>
                    {lang.trim()}
                  </Badge>
                ))
              ) : (
                <NotProvidedText>No languages specified</NotProvidedText>
              )}
            </BadgeContainer>
            
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
        
        <FlexContainer gap={16}>
          <Button onClick={handleUpdateProfile}>
            Update Profile
          </Button>
          <Button onClick={handleUpdateEmail}>
            Update Email
          </Button>
          <Button onClick={handleUpdatePassword}>
            Update Password
          </Button>
          <Button 
            onClick={handleLogout} 
            style={{
              backgroundColor: "#d9534f",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            <i className="fas fa-sign-out-alt"></i> 
            Log Out
          </Button>
          <div>
          <input
  type="file"
  accept="image/*"
  onChange={(e) => handleImageChange(e)}
  style={{ marginTop: "16px" }}
/>
<Button onClick={handleImageUpload}>Upload New Image</Button></div>

        </FlexContainer>
      </Card>
    </Container>
  );
};

export default UserProfile;