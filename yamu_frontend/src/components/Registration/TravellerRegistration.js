import React from "react";
import "./Registration.css";
import travelImage from "../../assets/images/travelimage.png"; // Import image

const TravellerRegistration = () => {
  return (
    <div
      className="registration-container"
      style={{
        backgroundImage: `url(${travelImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="registration-box">
        <h2>Traveller Registration</h2>
        <form className="registration-form">
          <label>Name</label>
          <input type="text" placeholder="Enter your name" />

          <label>Nationality</label>
          <input type="text" placeholder="Enter your nationality" />

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

          <button className="register-btn">Begin Journey</button>
        </form>
      </div>
    </div>
  );
};

export default TravellerRegistration;
