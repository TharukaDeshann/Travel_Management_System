import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import "./Registration.css";
import travelImage from "../../assets/images/registerpageimage.png"; // Background image

// Validation Schema
const schema = yup.object().shape({
  firstName: yup
    .string()
    .min(3, "Must be at least 3 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters")
    .required("First Name is required"),
  lastName: yup
    .string()
    .min(3, "Must be at least 3 characters")
    .matches(/^[A-Za-z\s]+$/, "Name can only contain letters")
    .required("Last Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup
    .string()
    .min(8, "Must be at least 8 characters")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Must contain 1 uppercase, 1 number, 1 special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits")
    .required("Phone number is required"),
  address: yup.string().min(5, "Address must be at least 5 characters").required("Address is required"),
  userType: yup.string().required("User type is required"),
});

const CommonRegistration = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data) => {
    console.log("Form Data Submitted:", data);
    if (data.userType === "guide") {
      navigate("/guide-register");
    } else if (data.userType === "traveller") {
      navigate("/registertraveller");
    } else {
      alert("Please select a valid user type.");
    }
  };

  return (
    <div className="registration-container" style={{ backgroundImage: `url(${travelImage})`, backgroundSize: "cover" }}>
      <div className="registration-box">
        <form className="registration-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="input-group">
            <label>First Name</label>
            <input type="text" {...register("firstName")} placeholder="Enter your first name" autoCapitalize="words" />
            <p className="error">{errors.firstName?.message}</p>
          </div>

          <div className="input-group">
            <label>Last Name</label>
            <input type="text" {...register("lastName")} placeholder="Enter your last name" autoCapitalize="words" />
            <p className="error">{errors.lastName?.message}</p>
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" {...register("email")} placeholder="Enter your email" />
            <p className="error">{errors.email?.message}</p>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" {...register("password")} placeholder="Enter your password" autoComplete="off" />
            <p className="error">{errors.password?.message}</p>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" {...register("confirmPassword")} placeholder="Confirm your password" autoComplete="off" />
            <p className="error">{errors.confirmPassword?.message}</p>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" {...register("phoneNumber")} placeholder="Enter your phone number" />
            <p className="error">{errors.phoneNumber?.message}</p>
          </div>

          <div className="input-group">
            <label>Address</label>
            <input type="text" {...register("address")} placeholder="Enter your address" />
            <p className="error">{errors.address?.message}</p>
          </div>

          <div className="input-group">
            <label>User Type</label>
            <select {...register("userType")}>
              <option value="">Select user type</option>
              <option value="guide">Guide</option>
              <option value="traveller">Traveller</option>
            </select>
            <p className="error">{errors.userType?.message}</p>
          </div>

          <button type="submit" className="register-btn">Next</button>
        </form>
      </div>
    </div>
  );
};

export default CommonRegistration;