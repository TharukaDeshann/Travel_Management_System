import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, fetchLoggedInUser } from "../services/authService";
import { useUser } from "../context/UserContext";
import { useNotification } from "../hooks/useNotification";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "antd";

// Custom styled components
import {
  Form,
  FormGroup,
  Label,
  Input,
  PasswordInput,
  ErrorMessage,
  FlexContainer,
  LinkText,
  Divider
} from "../components/StyledComponents";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { showSuccess, showError } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ email: formData.email, password: formData.password });
      showSuccess("Login successful!");

      try {
        const userData = await fetchLoggedInUser();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        if (userData.role === "TRAVELER") {
          navigate("/traveler-dashboard");
        } else if (userData.role === "GUIDE") {
          navigate("/guide-dashboard");
        } else if (userData.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (userError) {
        showError("Login succeeded but failed to fetch user data.");
        console.error("User fetch error:", userError);
      }

    } catch (err) {
      let errorMsg = "Login failed.";
      if (err.response) {
        const status = err.response.status;
        if (status === 401) errorMsg = "Invalid email or password.";
        else if (status === 403) errorMsg = "Account locked.";
        else if (status === 404) errorMsg = "User not found.";
        else if (status === 429) errorMsg = "Too many attempts. Try again.";
        else if (err.response.data?.error) errorMsg = err.response.data.error;
      } else if (err.request) {
        errorMsg = "Network error. Check your internet.";
      }

      showError(errorMsg);
      console.error("Login error:", err);
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

      <Divider><span>Don't have an account?</span></Divider>

      <FlexContainer justifyContent="center">
        <LinkText to="/register">Sign up</LinkText>
      </FlexContainer>
    </AuthLayout>
  );
};

export default Login;
