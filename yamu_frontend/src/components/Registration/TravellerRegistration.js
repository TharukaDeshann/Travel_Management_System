import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Registration.css";
import travelImage from "../../assets/images/travelimage.png"; // Background image

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().matches(/^[A-Za-z\s]+$/, "Name can only contain letters").required("Name is required"),
  nationality: yup.string().matches(/^[A-Za-z\s]+$/, "Nationality can only contain letters").required("Nationality is required"),
  contact: yup.string().matches(/^[0-9]{1,15}$/, "Contact number must be between 1 and 15 digits").required("Contact number is required"),
  address: yup.string().required("Address is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Confirm Password is required"),
});

const TravellerRegistration = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data) => {
    console.log("Traveller Form Data:", data);
    alert("Traveller Registration Successful!");
  };

  return (
    <div className="registration-container" style={{ backgroundImage: `url(${travelImage})`, backgroundSize: "cover" }}>
      <div className="registration-box">
        
        <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
          <label>Name</label>
          <input type="text" {...register("name")} placeholder="Enter your name" />
          <p className="error">{errors.name?.message}</p>

          <label>Nationality</label>
          <input type="text" {...register("nationality")} placeholder="Enter your nationality" />
          <p className="error">{errors.nationality?.message}</p>

          <label>Contact Number</label>
          <input type="text" {...register("contact")} placeholder="Enter your contact number" />
          <p className="error">{errors.contact?.message}</p>

          <label>Address</label>
          <input type="text" {...register("address")} placeholder="Enter your address" />
          <p className="error">{errors.address?.message}</p>

          <label>E-mail</label>
          <input type="email" {...register("email")} placeholder="Enter your email" />
          <p className="error">{errors.email?.message}</p>

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

export default TravellerRegistration;