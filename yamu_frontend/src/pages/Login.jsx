import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, fetchLoggedInUser } from "../services/authService";
import { useUser } from "../context/UserContext";
import { useNotification } from "../hooks/useNotification";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "antd";
// Custom styled components instead of Ant Design
import {
  Form,
  FormGroup,
  Label,
  Input,
  PasswordInput,
  ErrorMessage,
  FlexContainer,
  LinkText,
  Divider,
} from "../components/StyledComponents";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
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

      // Fetch user data and navigate
      try {
        const userData = await fetchLoggedInUser();
        setUser(userData);
        console.log("User data fetched:", userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // Redirect based on role
        if (userData.role === "TRAVELER") {
          navigate("/traveler-dashboard");
        } else if (userData.role === "GUIDE") {
          navigate("/guide-dashboard");
        } else if (userData.role === "ADMIN") {
          navigate("/admin-overview");
        } else {
          navigate("/dashboard");
        }
      } catch (userError) {
        showError(
          "Login successful but couldn't load user data. Please try again."
        );
        console.error("Error fetching user data:", userError);
      }
    } catch (err) {
      console.error("Login error:", err);

      // Handle detailed login errors
      let errorMsg = "Failed to login. Please try again.";

      if (err.response) {
        // Handle specific HTTP error responses
        const status = err.response.status;
        const serverError = err.response.data?.error;

        if (status === 401) {
          // Use server-provided error message or default
          errorMsg =
            serverError ||
            "Invalid email or password. Please check your credentials.";
        } else if (status === 403) {
          errorMsg =
            serverError ||
            "Your account has been locked. Please contact support.";
        } else if (status === 404) {
          errorMsg =
            serverError ||
            "Account not found. Please check your email or sign up.";
        } else if (status === 429) {
          errorMsg =
            serverError || "Too many login attempts. Please try again later.";
        } else if (status >= 500) {
          errorMsg = "Server error. Please try again later.";
        } else if (serverError) {
          // Use any server-provided error message
          errorMsg = serverError;
        }
      } else if (err.request) {
        // Network error
        errorMsg = "Network error. Please check your internet connection.";
      } else {
        // Other errors
        errorMsg = "An unexpected error occurred. Please try again.";
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
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ width: "100%", marginTop: "16px" }}
          size="large"
        >
          {loading ? "Logging in..." : "Log In"}
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
