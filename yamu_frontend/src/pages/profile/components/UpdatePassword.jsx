// src/pages/UpdatePassword.jsx
import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../services/axiosInstance";
import { updatePassword } from "../../../services/userService";
import { useNotification } from "../../../hooks/useNotification";

const UpdatePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return message.error("New password and confirmation do not match.");
    }

    try {
        const response = await updatePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        });
      
        showSuccess("Password updated successfully.");
        navigate("/profile"); //Redirect to profile page after successful update
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update password."
      );
    }
  };

  return (
    <Card title="Update Password" style={{ maxWidth: 500, margin: "auto" }}>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        requiredMark={false}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: "Enter your current password" }]}
        >
          <Input.Password placeholder="Current password" size="large" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[{ required: true, message: "Enter your new password" }]}
        >
          <Input.Password placeholder="New password" size="large" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Passwords do not match");
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UpdatePassword;
