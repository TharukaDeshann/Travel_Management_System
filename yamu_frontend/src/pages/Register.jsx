import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { AuthLayout } from "../components/AuthLayout";
import { FormInput } from "../components/FormInput";
import { ToggleSwitch } from "../components/ToggleSwitch";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaInfoCircle,
} from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");

  const validationSchema = Yup.object({
    // Common fields
    ...(step === 1 && {
      firstName: Yup.string().min(3, "Must be at least 3 characters").required("First Name is required"),
      lastName: Yup.string().min(3, "Must be at least 3 characters").required("Last Name is required"),
      email: Yup.string().email("Invalid email format").required("Email is required"),
      password: Yup.string()
        .min(8,  "Must be at least 8 characters")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password Must contain 1 uppercase, 1 number, 1 special character")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    ...(step === 2 && {
      phonenumber: Yup.string().matches(/^[0-9]{10,15}$/,  "Phone number must be 10 to 15 digits").required("Phone number is required"),
      address: Yup.string().required("Address is required"),
      role: Yup.string().required("User Type is required"),
      ...(userType === "TRAVELER" && { nationality: Yup.string().required("Nationality is required") }),
      ...(userType === "GUIDE" && {
        expertiseCityRegion: Yup.string().required("Expertise City/Region is required"),
        language: Yup.string().required("Language is required"),
        about: Yup.string(),
        vehicleAvailability: Yup.boolean().required("Vehicle Availability is required"),
      }),
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
      vehicleAvailability: false,
    },
    validationSchema,
    onSubmit: async (values , {setSubmitting}) => {
      if (step === 1) return setStep(2);
      
      const payload = {
        ...values,
        contactNumber: values.phonenumber,
        vehicleAvailability: values.vehicleAvailability ? 1 : 0,
      };
      
      try {
        await register(payload);
        navigate("/login");
      } catch (err) {
        formik.setErrors({ general: err.response?.data?.error || "Registration failed. Try again" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const commonFields = [
    { id: "firstName", icon: FaUser, placeholder: "First Name" },
    { id: "lastName", icon: FaUser, placeholder: "Last Name" },
    { id: "email", icon: FaEnvelope, placeholder: "Email" },
    { id: "password", icon: FaLock, placeholder: "Password", type: "password" },
    { id: "confirmPassword", icon: FaLock, placeholder: "Confirm Password", type: "password" },
  ];

  const specificFields = [
    { id: "phonenumber", icon: FaPhone, placeholder: "Phone Number" },
    { id: "address", icon: FaMapMarkerAlt, placeholder: "Address" },
    ...(userType === "TRAVELER"
      ? [{ id: "nationality", icon: FaGlobe, placeholder: "Nationality" }]
      : []),
    ...(userType === "GUIDE"
      ? [
          { id: "expertiseCityRegion", icon: FaMapMarkerAlt, placeholder: "Expertise Region" },
          { id: "language", icon: FaGlobe, placeholder: "Languages" },
          { id: "about", icon: FaInfoCircle, placeholder: "About You" },
        ]
      : []),
  ];

  return (
    <AuthLayout title="Join YAMU Travel" subtitle="Start your adventure today!">
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {formik.errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {formik.errors.general}
          </div>
        )}

        <div className="space-y-4">
          {/* Step Indicator */}
          <div className="flex justify-center mb-6">
            <div className={`w-4 h-4 rounded-full mx-1 ${step === 1 ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`w-4 h-4 rounded-full mx-1 ${step === 2 ? "bg-blue-600" : "bg-gray-300"}`} />
          </div>

          {step === 1 && commonFields.map((field) => (
            <FormInput
              key={field.id}
              formik={formik}
              {...field}
              error={formik.touched[field.id] && formik.errors[field.id]}
            />
          ))}

          {step === 2 && (
            <>
              <div className="mb-4">
                <label className="block mb-2 font-medium">You are joining as:</label>
                <div className="grid grid-cols-2 gap-4">
                  {["TRAVELER", "GUIDE"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setUserType(role);
                        formik.setFieldValue("role", role);
                      }}
                      className={`p-4 rounded-lg border-2 ${
                        userType === role
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                {formik.touched.role && formik.errors.role && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
                )}
              </div>

              {userType && (
                <>
                  {specificFields.map((field) => (
                    <FormInput
                      key={field.id}
                      formik={formik}
                      {...field}
                      error={formik.touched[field.id] && formik.errors[field.id]}
                    />
                  ))}

                  {userType === "GUIDE" && (
                    <ToggleSwitch
                      label="Vehicle Available"
                      checked={formik.values.vehicleAvailability}
                      onChange={(val) => formik.setFieldValue("vehicleAvailability", val)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between mt-8">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Back
            </button>
          )}
          <button
  type="submit"
  disabled={formik.isSubmitting}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-blue-400 flex items-center justify-center"
>
  {formik.isSubmitting ? (
    <div className="flex items-center">
      <div className="spinner"></div>
      <span className="ml-2">Registering...</span>
    </div>
  ) : (
    "Register"
  )}
</button>
        </div>
      </form>

      <p className="text-center mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
};

export default Register;