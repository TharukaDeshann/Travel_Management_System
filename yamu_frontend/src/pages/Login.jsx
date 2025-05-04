import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, fetchLoggedInUser } from "../services/authService";
import { useUser } from "../context/UserContext";
import { useNotification } from "../hooks/useNotification";
import { AuthLayout } from "../components/AuthLayout";

// Custom styled components instead of Ant Design
import {
  Form,
  FormGroup,
  Label,
  Input,
  PasswordInput,
  Button,
  ErrorMessage,
  FlexContainer,
  LinkText,
  Divider
} from "../components/StyledComponents";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { showSuccess, showError } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      // Show success on successful login
      showSuccess("Login successful! Welcome back.");
      
      // Small delay to ensure notification is rendered before navigation
      {
        try {
          const userData = await fetchLoggedInUser();
          console.log("User data fetched successfully:", userData);
          setUser(userData);
          
          // Redirect based on role
          if (userData.role === "TRAVELER") {
            navigate("/traveler-dashboard");
          } else if (userData.role === "GUIDE") {
            navigate("/guide-dashboard");
          } else if (userData.role === "ADMIN") {
            navigate("/admin-dashboard");
          }
           else {
            // Default fallback if role is not recognized
            navigate("/dashboard");
          }
        } catch (userError) {
          // Handle error fetching user data
          showError("Login successful but couldn't load user data. Please try again.");
          console.error("Error fetching user data:", userError);
        }
      }
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle detailed login errors
      let errorMsg = "Failed to login. Please try again.";
      
      if (err.response) {
        // Handle specific HTTP error responses
        const status = err.response.status;
        
        if (status === 401) {
          errorMsg = "Invalid email or password. Please check your credentials.";
        } else if (status === 403) {
          errorMsg = "Your account has been locked. Please contact support.";
        } else if (status === 404) {
          errorMsg = "Account not found. Please check your email or sign up.";
        } else if (status === 429) {
          errorMsg = "Too many login attempts. Please try again later.";
        } else if (err.response.data?.error) {
          // Use server-provided error if available
          errorMsg = err.response.data.error;
        }
      } else if (err.request) {
        // Network error
        errorMsg = "Network error. Please check your internet connection.";
      }
      
      console.log("Showing error notification:", errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to plan your next trip!">
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            hasError={!!errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            hasError={!!errors.password}
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>

        <FlexContainer justifyContent="flex-end">
          <LinkText to="/forgot-password">Forgot password?</LinkText>
        </FlexContainer>

        <Button 
          type="submit" 
          disabled={loading}
          $fullWidth // Using the transient prop syntax
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Form>

      <Divider>
        <span>Don't have an account?</span>
      </Divider>
      
      <FlexContainer justifyContent="center">
        <LinkText to="/register">Sign up</LinkText>
      </FlexContainer>
    </AuthLayout>
  );
};

export default Login;