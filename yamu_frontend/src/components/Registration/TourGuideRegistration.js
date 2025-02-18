import React from "react";
import "./Registration.css";
import guideImage from "../../assets/images/guideimage.png"; // Import image

const TourGuideRegistration = () => {
  return (
    <div
      className="registration-container"
      style={{
        backgroundImage: `url(${guideImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="registration-box">
        <h2>Tour Guide Registration</h2>
        <form className="registration-form">
          <label>Name</label>
          <input type="text" placeholder="Enter your name" />

          <label>Language</label>
          <input type="text" placeholder="Enter languages spoken" />

          <label>Expertise</label>
          <input type="text" placeholder="Enter your expertise" />

          <label>Contact Number</label>
          <input type="text" placeholder="Enter your contact number" />

          <label>Address</label>
          <input type="text" placeholder="Enter your address" />

          <label>E-mail</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm your password" />

          <button className="register-btn">Lead Tours</button>
        </form>
      </div>
    </div>
  );
};

export default TourGuideRegistration;
