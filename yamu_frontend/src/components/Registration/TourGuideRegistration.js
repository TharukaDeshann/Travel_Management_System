import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Registration.css";
import guideImage from "../../assets/images/guideimage.png"; // Import background image

// Validation Schema
const schema = yup.object().shape({
  language: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Language can only contain letters")
    .required("Language is required"),
  expertise: yup.string().required("Expertise is required"),
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
          <label>Language</label>
          <input type="text" {...register("language")} placeholder="Enter languages spoken" />
          <p className="error">{errors.language?.message}</p>

          <label>Expertise</label>
          <input type="text" {...register("expertise")} placeholder="Enter your expertise" />
          <p className="error">{errors.expertise?.message}</p>

          <label>About</label>
          <textarea {...register("about")} placeholder="Tell us about yourself" className="about-field" />
          <p className="error">{errors.about?.message}</p>

          <div className="vehicle-availability-container">
            <label className="vehicle-availability-label">Vehicle Availability</label>
            <input
              type="checkbox"
              {...register("vehicleAvailability")}
              onChange={(e) => setVehicleAvailability(e.target.checked)}
            />
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

          <button type="submit" className="register-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default TourGuideRegistration;