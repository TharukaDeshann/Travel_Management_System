import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { FaUser, FaLock } from "react-icons/fa";
import travelBg from '../images/travel-bg.jpeg';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login({ email, password });
      if (response.status === 200) {
        navigate("/traveler-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

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
      {/* Overlay for better readability */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(1px)'
        }}
      />
      
      {/* Login form container */}
      <div className="relative z-10 bg-white/90 p-8 shadow-2xl rounded-2xl w-full max-w-md mx-4 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Welcome Back</h2>
        <p className="text-gray-600 text-center mb-8">Log in to plan your next trip!</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div className="text-right">
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm hover:underline transition-colors duration-200">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-blue-400"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;