// src/pages/UpdateEmail.jsx
import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../services/axiosInstance";
import { updateEmail } from "../../../services/userService";
import { useNotification } from "../../../hooks/useNotification";

const API_URL = "http://localhost:8080/api/users";
const UpdateEmail = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification(); 

  const onFinish = async (values) => {
    try {
     
      const response = await updateEmail({
        newEmail: values.newEmail,
      });
      if (response.status !== 200) {
        throw new Error("Failed to update email.");
      }
      console.log("Response:", response); // log the response for debugging
    

      // show success message on successful email update
      showSuccess("Verification email sent successfully. Please check your inbox.");
      navigate("/verify-email-pending");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update email. Try again."
      );
    }
  };

  return (
    <Card title="Update Email" style={{ maxWidth: 500, margin: "auto" }}>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
        autoComplete="off"
      >
        <Form.Item
          name="newEmail"
          label="New Email"
          rules={[
            { required: true, message: "Please enter your new email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input placeholder="Enter new email" size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Send Verification Email
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UpdateEmail;
