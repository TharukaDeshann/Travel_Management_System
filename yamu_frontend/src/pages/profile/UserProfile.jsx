import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";

const schema = yup.object().shape({
  firstName: yup.string().required().min(3).max(50),
  lastName: yup.string().nullable(),
  contactNumber: yup.string().required().matches(/^[0-9]{10,15}$/),
  address: yup.string().required(),
  nationality: yup.string(),
  expertiseCityRegion: yup.string(),
  language: yup.string(),
  about: yup.string(),
  vehicleAvailability: yup.boolean(),
});

export default function UserProfile() {
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset(user); // Preload existing user data
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/users/${user.id}`,
        data
      );
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`http://localhost:8080/api/users/${user.id}`);
        toast.success("Account deleted.");
        // Optional: Redirect to login or home
      } catch (err) {
        toast.error("Failed to delete account.");
      }
    }
  };

  return (
    <motion.div
      className="container mx-auto p-4 max-w-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input placeholder="First Name" {...register("firstName")} />
        <p className="text-red-500">{errors.firstName?.message}</p>

        <input placeholder="Last Name" {...register("lastName")} />
        <input placeholder="Contact Number" {...register("contactNumber")} />
        <p className="text-red-500">{errors.contactNumber?.message}</p>

        <input placeholder="Address" {...register("address")} />
        <p className="text-red-500">{errors.address?.message}</p>

        {/* Traveler/Guide specific fields */}
        <input placeholder="Nationality" {...register("nationality")} />
        <input placeholder="Expertise Region" {...register("expertiseCityRegion")} />
        <input placeholder="Language" {...register("language")} />
        <textarea placeholder="About" {...register("about")} />
        <label>
          Vehicle Available?
          <input type="checkbox" {...register("vehicleAvailability")} />
        </label>

        <button type="submit" className="btn-primary">Update</button>
        <button type="button" onClick={handleDelete} className="btn-danger">
          Delete Account
        </button>
      </form>
    </motion.div>
  );
}
