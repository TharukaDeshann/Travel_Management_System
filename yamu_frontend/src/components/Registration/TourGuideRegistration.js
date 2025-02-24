import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Registration.css";
import guideImage from "../../assets/images/guideimage.png"; // Import background image

// Validation Schema
const schema = yup.object().shape({
  name: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters")
    .required("Name is required"),
  language: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Language can only contain letters")
    .required("Language is required"),
  expertise: yup.string().required("Expertise is required"),
  contact: yup
    .string()
    .matches(/^[0-9]{1,15}$/, "Contact number must be between 1 and 15 digits")
    .required("Contact number is required"),
  address: yup.string().required("Address is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  about: yup.string().required("About is required"),
  vehicleType: yup.string().when("vehicleAvailability", {
    is: true,
    then: yup.string().required("Vehicle type is required"),
  }),
  numberOfSeats: yup.number().when("vehicleAvailability", {
    is: true,
    then: yup.number().required("Number of seats is required").positive().integer(),
  }),
});

const TourGuideRegistration = () => {
  const [vehicleAvailability, setVehicleAvailability] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Tour Guide Form Data:", data);
    alert("Tour Guide Registration Successful!");
  };

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
        
        <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input type="text" {...register("name")} placeholder="Enter your name" />
          <p className="error">{errors.name?.message}</p>

          <label>Language</label>
          <input type="text" {...register("language")} placeholder="Enter languages spoken" />
          <p className="error">{errors.language?.message}</p>

          <label>E-mail</label>
          <input type="email" {...register("email")} placeholder="Enter your email" />
          <p className="error">{errors.email?.message}</p>

          <label>Expertise</label>
          <input type="text" {...register("expertise")} placeholder="Enter your expertise" />
          <p className="error">{errors.expertise?.message}</p>

          <label>About</label>
          <textarea {...register("about")} placeholder="Tell us about yourself" className="about-field" />
          <p className="error">{errors.about?.message}</p>

          <label>Contact Number</label>
          <input type="text" {...register("contact")} placeholder="Enter your contact number" />
          <p className="error">{errors.contact?.message}</p>

          <div className="vehicle-availability-container">
            <label className="vehicle-availability-label">
              Vehicle Availability
              <input
                type="checkbox"
                {...register("vehicleAvailability")}
                onChange={(e) => setVehicleAvailability(e.target.checked)}
              />
            </label>
          </div>

          {vehicleAvailability && (
            <>
              <label>Vehicle Type</label>
              <input type="text" {...register("vehicleType")} placeholder="Enter vehicle type" />
              <p className="error">{errors.vehicleType?.message}</p>

              <label>Number of Seats</label>
              <input type="number" {...register("numberOfSeats")} placeholder="Enter number of seats" />
              <p className="error">{errors.numberOfSeats?.message}</p>
            </>
          )}

          <label>Address</label>
          <input type="text" {...register("address")} placeholder="Enter your address" />
          <p className="error">{errors.address?.message}</p>

          <label>Password</label>
          <input type="password" {...register("password")} placeholder="Enter your password" />
          <p className="error">{errors.password?.message}</p>

          <label>Confirm Password</label>
          <input type="password" {...register("confirmPassword")} placeholder="Confirm your password" />
          <p className="error">{errors.confirmPassword?.message}</p>

          <button type="submit" className="register-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default TourGuideRegistration;