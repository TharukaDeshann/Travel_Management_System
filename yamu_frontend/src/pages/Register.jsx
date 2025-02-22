import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import travelBg from '../images/travel-bg.jpeg'; // Use the same background as login

const Register = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string().min(3, "Must be at least 3 characters").required("Username is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Must contain 1 uppercase, 1 number, 1 special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], "Passwords must match")
      .required("Confirm password is required"),
    phonenumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits")
      .required("Phone number is required"),
    address: Yup.string().min(5, "Address must be at least 5 characters").required("Address is required"),
  });

  const formik = useFormik({
    initialValues: { username: "", email: "", password: "", confirmPassword: "", phonenumber: "", address: "" },
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
    <div 
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: `url(${travelBg})`,
        backgroundSize: "100% 100%",
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 "
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(1px)'
        }}
      />

      {/* Registration form container */}
      <div className="relative z-10 bg-white/90 p-8 shadow-2xl rounded-2xl w-full max-w-lg mx-4 backdrop-blur-sm ">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Join YAMU Travel</h2>
        <p className="text-gray-600 text-center mb-8">Sign up and start your adventure today!</p>

        {formik.errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg ">
            {formik.errors.general}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6 ">
          {[
            { label: "Username", id: "username", type: "text", icon: <FaUser /> },
            { label: "Email", id: "email", type: "email", icon: <FaEnvelope /> },
            { label: "Password", id: "password", type: "password", icon: <FaLock /> },
            { label: "Confirm Password", id: "confirmPassword", type: "password", icon: <FaLock /> },
            { label: "Phone Number", id: "phonenumber", type: "text", icon: <FaPhone /> },
            { label: "Address", id: "address", type: "text", icon: <FaMapMarkerAlt /> },
          ].map(({ label, id, type, icon }) => (
            <div key={id} className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
              <input
                type={type}
                id={id}
                {...formik.getFieldProps(id)}
                placeholder={label}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {formik.touched[id] && formik.errors[id] && (
                <p className="mt-1 text-red-500 text-sm">{formik.errors[id]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-blue-400"
          >
            {formik.isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
