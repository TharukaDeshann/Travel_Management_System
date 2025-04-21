import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Divider, Spin } from "antd";
import { UserOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons";
import { login } from "../services/authService";
import { AuthLayout } from "../components/AuthLayout";

const Login = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await login({ 
        email: values.email, 
        password: values.password 
      });
      
      if (response.status === 200) {
        if (response.data?.role === "TRAVELER") {
          navigate("/traveler-dashboard");
        } else if (response.data?.role === "GUIDE") {
          navigate("/guide-dashboard");
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid email or password.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to plan your next trip!">
      {error && (
        <Alert
          message="Login Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError("")}
        />
      )}

      <Form
        form={form}
        name="login"
        layout="vertical"
        onFinish={handleLogin}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email format" }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="Email" 
            size="large" 
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Password" 
            size="large" 
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <a href="/forgot-password" style={{ color: "#1890ff" }}>
              Forgot password?
            </a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large" 
            block
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form.Item>
      </Form>

      <Divider>
        <span style={{ color: "#666666", fontSize: "14px" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#1890ff" }}>
            Sign up
          </a>
        </span>
      </Divider>
    </AuthLayout>
  );
};

export default Login;