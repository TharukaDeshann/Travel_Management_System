import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    username: Yup.string().min(3, "Must be at least 3 characters").required("Username is required"),
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
    initialValues: { username: "", email: "", password: "", phonenumber: "", address: "" },
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
    <div className="flex min-h-screen bg-gray justify-center items-center">
      <div className="bg-white p-8 shadow-lg rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Create an Account</h2>
        <p className="text-gray-500 text-center mb-6">Join us to start planning your next adventure!</p>
        {formik.errors.general && <p className="text-red-500 text-sm text-center">{formik.errors.general}</p>}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {[
            { label: "Username", id: "username", type: "text" },
            { label: "Email", id: "email", type: "email" },
            { label: "Password", id: "password", type: "password" },
            { label: "Phone Number", id: "phonenumber", type: "text" },
            { label: "Address", id: "address", type: "text" },
          ].map(({ label, id, type }) => (
            <div key={id}>
              <label className="block text-gray-700">{label}:</label>
              <input
                type={type}
                id={id}
                {...formik.getFieldProps(id)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />
              {formik.touched[id] && formik.errors[id] && <p className="text-red-500 text-sm">{formik.errors[id]}</p>}
            </div>
          ))}
          <button type="submit" disabled={formik.isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
            {formik.isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-gray-600 text-sm text-center mt-4">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
