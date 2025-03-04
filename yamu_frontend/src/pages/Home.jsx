import Navbar from "../components/Navbar"; 
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate("/login");
  };

  return (
    <div 
      className="h-screen flex items-center justify-between px-20 bg-gradient-to-r from-gray-100 to-white relative" 
      style={{ backgroundImage: "url('/home.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Logo in the Top Left Corner */}
      <div className="absolute top-6 left-6">
        <img 
          src="/logo.png" 
          alt="YAMU Logo" 
          className="w-40 h-auto"
        />
      </div>

      {/* Left Section */}
      <div className="max-w-lg">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1 }}
          className="text-5xl font-bold text-gray-900 mb-4 font-poppins"
        >
          Plan Your Perfect Trip with <span className="text-blue-600">YAMU - යමු</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg text-gray-600 mb-6 font-roboto"
        >
          Explore Sri Lanka like never before with AI-powered recommendations, seamless bookings, and personalized travel plans.
        </motion.p>
        <div className="flex space-x-4">
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold shadow-md hover:bg-blue-700 transition"
            onClick={handleGetStartedClick}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;