import React, { useState } from "react";
import { Form, Input, Button, Modal } from "antd";
import { updatePassword } from "../../../services/userService";
import { useNotification } from "../../../hooks/useNotification";

const UpdatePasswordModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      showSuccess("Password updated successfully.");
      
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update password.");
    } finally{
      setLoading(false);
      form.resetFields();
      setTimeout(() => {
        onClose(); // Close the modal after 5 seconds
      }, 5000);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      title="Update Password"
      footer={null}
      destroyOnClose
    >
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "rgba(25, 118, 210, 0.05)",
          borderLeft: "4px solid #1976d2",
          borderRadius: 6,
          fontSize: 14,
          color: "#666",
        }}
      >
        For security, enter your current password and then your new one. Make
        sure it is strong and unique.
      </div>

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
          rules={[
            { required: true, message: "Password is required" },
            { min: 8, message: "Must be at least 8 characters" },
            {
              pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
              message:
                "Password Must contain 1 uppercase, 1 number, 1 special character",
            },
          ]}
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
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePasswordModal;
