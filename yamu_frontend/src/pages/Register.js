import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();

  
  const validationSchema = Yup.object({
    firstname: Yup.string().required("firstname is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Must contain 1 uppercase, 1 number, 1 special character")
      .required("Password is required"),
    phonenumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits")
      .required("Phone number is required"),
    address: Yup.string().min(5, "Address must be at least 5 characters").required("Address is required"),
  });

  const formik = useFormik({
    initialValues: { firstname: "", lastname: "",  email: "", password: "", phonenumber: "", address: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await register(values);
        if (response.message) {
          navigate("/login");
        }
      } catch (err) {
        setErrors({ general: err.response?.data?.error || "Registration failed. Try again." });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        <p>Join us to start planning your next adventure!</p>
        {formik.errors.general && <p className="error-message">{formik.errors.general}</p>}
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstname">First Name:</label>
            <input type="text" id="firstname" {...formik.getFieldProps("firstname")} />
            {formik.touched.firstname && formik.errors.firstname && <p className="error-message">{formik.errors.firstname}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Last Name:</label>
            <input type="text" id="lastname" {...formik.getFieldProps("lastname")} />

          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" {...formik.getFieldProps("email")} />
            {formik.touched.email && formik.errors.email && <p className="error-message">{formik.errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" {...formik.getFieldProps("password")} />
            {formik.touched.password && formik.errors.password && <p className="error-message">{formik.errors.password}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phonenumber">Phone Number:</label>
            <input type="text" id="phonenumber" {...formik.getFieldProps("phonenumber")} />
            {formik.touched.phonenumber && formik.errors.phonenumber && <p className="error-message">{formik.errors.phonenumber}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input type="text" id="address" {...formik.getFieldProps("address")} />
            {formik.touched.address && formik.errors.address && <p className="error-message">{formik.errors.address}</p>}
          </div>
          <button type="submit" disabled={formik.isSubmitting} className="auth-button">
            {formik.isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
