import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./Registration.css";
import guideImage from "../../assets/images/guideimage.png"; // Use the same background image as the guide form

// Validation Schema
const schema = yup.object().shape({
  firstname: yup.string().matches(/^[A-Za-z\s]+$/, "Name can only contain letters").required("First name is required"),
  lastname: yup.string().matches(/^[A-Za-z\s]+$/, "Name can only contain letters").required("Last name is required"),
  contact: yup.string().matches(/^[0-9]{1,15}$/, "Contact number must be between 1 and 15 digits").required("Contact number is required"),
  address: yup.string().required("Address is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Confirm Password is required"),
});

const TravellerForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data) => {
    console.log("Traveller Form Data:", data);
    alert("Traveller Registration Successful!");
  };

  return (
    <div className="registration-container" style={{ backgroundImage: `url(${guideImage})`, backgroundSize: "cover" }}>
      <div className="registration-box">
        
        <form className="registration-form" onSubmit={handleSubmit(onSubmit)}>
          <label>First Name</label>
          <input type="text" {...register("firstname")} placeholder="Enter your first name" />
          <p className="error">{errors.firstname?.message}</p>

          <label>Last Name</label>
          <input type="text" {...register("lastname")} placeholder="Enter your last name" />
          <p className="error">{errors.lastname?.message}</p>

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

export default TravellerForm;