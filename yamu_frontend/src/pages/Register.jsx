import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaCar,
  FaInfoCircle,
} from "react-icons/fa";
import travelBg from "../images/travel-bg.jpeg";

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(""); // Track selected user type
  const [vehicleAvailability, setVehicleAvailability] = useState(0); // Toggle state for vehicle availability

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(3, "Must be at least 3 characters")
      .required("First Name is required"),
    lastName: Yup.string()
      .min(3, "Must be at least 3 characters")
      .required("Last Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Must contain 1 uppercase, 1 number, 1 special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    phonenumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10 to 15 digits")
      .required("Phone number is required"),
    address: Yup.string()
      .min(5, "Address must be at least 5 characters")
      .required("Address is required"),
    role: Yup.string().required("User Type is required"),
    nationality: Yup.string().when("role", {
      is: "TRAVELER",
      then: (schema) => schema.required("Nationality is required"),
    }),
    expertiseCityRegion: Yup.string().when("role", {
      is: "GUIDE",
      then: (schema) => schema.required("Expertise City/Region is required"),
    }),
    language: Yup.string().when("role", {
      is: "GUIDE",
      then: (schema) => schema.required("Language is required"),
    }),
    about: Yup.string().when("role", {
      is: "GUIDE",
      then: (schema) => schema.required("About section is required"),
    }),
    vehicleAvailability: Yup.string().when("role", {
      is: "GUIDE",
      then: (schema) => schema.required("Vehicle Availability is required"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phonenumber: "",
      address: "",
      role: "",
      nationality: "",
      expertiseCityRegion: "",
      language: "",
      about: "",
      vehicleAvailability: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Create the payload object with renamed fields
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          contactNumber: values.phonenumber, // Rename to match backend expectation
          address: values.address,
          role: values.role,
        };

        // Add role-specific fields
        if (values.role === "TRAVELER") {
          payload.nationality = values.nationality;
        } else if (values.role === "GUIDE") {
          payload.expertiseCityRegion = values.expertiseCityRegion;
          payload.language = values.language;
          payload.about = values.about;
          payload.vehicleAvailability = vehicleAvailability; // Use the toggle state value
        }

        const response = await register(payload);
        if (response.message) {
          navigate("/login");
        }
      } catch (err) {
        setErrors({
          general: err.response?.data?.error || "Registration failed. Try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${travelBg})`,
        backgroundSize: "cover",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 bg-white p-8 shadow-2xl rounded-2xl w-full max-w-xl mx-4 overflow-auto">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
          Join YAMU Travel
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Sign up and start your adventure today!
        </p>

        {formik.errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {formik.errors.general}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block mb-1 text-gray-700 font-medium"
            >
              First Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="firstName"
                {...formik.getFieldProps("firstName")}
                placeholder="First Name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block mb-1 text-gray-700 font-medium"
            >
              Last Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="lastName"
                {...formik.getFieldProps("lastName")}
                placeholder="Last Name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-gray-700 font-medium"
            >
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                id="email"
                {...formik.getFieldProps("email")}
                placeholder="Email"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-gray-700 font-medium"
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                id="password"
                {...formik.getFieldProps("password")}
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-1 text-gray-700 font-medium"
            >
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                {...formik.getFieldProps("confirmPassword")}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>

          
          <div>
            <label
              htmlFor="phonenumber"
              className="block mb-1 text-gray-700 font-medium"
            >
              Phone Number
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="phonenumber"
                {...formik.getFieldProps("phonenumber")}
                placeholder="Phone Number"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.phonenumber && formik.errors.phonenumber && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.phonenumber}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block mb-1 text-gray-700 font-medium"
            >
              Address
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="address"
                {...formik.getFieldProps("address")}
                placeholder="Address"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>
            )}
          </div>

          {/* User Role */}
          <div>
            <label
              htmlFor="role"
              className="block mb-1 text-gray-700 font-medium"
            >
              User Type
            </label>
            <select
              id="role"
              {...formik.getFieldProps("role")}
              onChange={(e) => {
                formik.handleChange(e);
                setUserType(e.target.value); // Update user type state
              }}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select User Type</option>
              <option value="TRAVELER">Traveler</option>
              <option value="GUIDE">Guide</option>
            </select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
            )}
          </div>

          {/* Traveler-Specific Field */}
          {userType === "TRAVELER" && (
            <div>
              <label
                htmlFor="nationality"
                className="block mb-1 text-gray-700 font-medium"
              >
                Nationality
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  id="nationality"
                  {...formik.getFieldProps("nationality")}
                  placeholder="Nationality"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {formik.touched.nationality && formik.errors.nationality && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.nationality}
                </p>
              )}
            </div>
          )}

          {/* Guide-Specific Fields */}
          {userType === "GUIDE" && (
            <>
              <div>
                <label
                  htmlFor="expertiseCityRegion"
                  className="block mb-1 text-gray-700 font-medium"
                >
                  Expertise City/Region
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    id="expertiseCityRegion"
                    {...formik.getFieldProps("expertiseCityRegion")}
                    placeholder="Expertise City/Region"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formik.touched.expertiseCityRegion &&
                  formik.errors.expertiseCityRegion && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.expertiseCityRegion}
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block mb-1 text-gray-700 font-medium"
                >
                  Language
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    id="language"
                    {...formik.getFieldProps("language")}
                    placeholder="Language"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formik.touched.language && formik.errors.language && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.language}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="about"
                  className="block mb-1 text-gray-700 font-medium"
                >
                  About
                </label>
                <div className="relative">
                  <FaInfoCircle className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    id="about"
                    {...formik.getFieldProps("about")}
                    placeholder="About"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formik.touched.about && formik.errors.about && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.about}
                  </p>
                )}
              </div>

              {/* Vehicle Availability Toggle */}
              <div>
                <label
                  htmlFor="vehicleAvailability"
                  className="block mb-1 text-gray-700 font-medium"
                >
                  Vehicle Availability
                </label>
                <div className="flex space-x-4">
  <button
    type="button"
    onClick={() => {
      setVehicleAvailability(1);
      formik.setFieldValue("vehicleAvailability", 1); // Update Formik state
    }}
    className={`flex-1 p-2 rounded-lg ${
      vehicleAvailability === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    Yes
  </button>
  <button
    type="button"
    onClick={() => {
      setVehicleAvailability(0);
      formik.setFieldValue("vehicleAvailability", 0); // Update Formik state
    }}
    className={`flex-1 p-2 rounded-lg ${
      vehicleAvailability === 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    No
  </button>
</div>
{formik.touched.vehicleAvailability && formik.errors.vehicleAvailability && (
  <p className="text-red-500 text-sm mt-1">{formik.errors.vehicleAvailability}</p>
)}
              </div>
            </>
          )}
           {/* Submit Button */}
           <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-blue-400"
          >
            {formik.isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-4">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
