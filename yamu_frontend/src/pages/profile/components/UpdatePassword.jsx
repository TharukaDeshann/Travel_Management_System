import React from "react";
import { Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "../../../services/userService";
import { useNotification } from "../../../hooks/useNotification";
import styled from "styled-components";

// Styled components
const StyledCard = styled(Card)`
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;

  .ant-card-head-title {
    font-size: 20px;
    font-weight: 600;
  }
`;

const FormContainer = styled.div`
  .ant-form-item-label {
    font-weight: 500;
  }

  .ant-btn-primary {
    height: 48px;
    font-weight: 600;
  }
`;

const PasswordNotice = styled.div`
  margin-bottom: 24px;
  padding: 12px;
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 6px;
  border-left: 4px solid #1976d2;
  font-size: 14px;
  color: #666;
`;

const UpdatePassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const onFinish = async (values) => {
    try {
      // Call the updatePassword service with the current and new passwords
      console.log(values);
      const response = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      console.log(response);
      
      showSuccess("Password updated successfully.");
      navigate("/profile"); // Redirect to profile page after successful update
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <StyledCard title="Update Password">
      <FormContainer>
        <PasswordNotice>
          For security, please enter your current password and then your desired new password.
          Make sure your new password is strong and not used on other sites.
        </PasswordNotice>
        
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
              { required: true, message: "Enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" }
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
            <Button type="primary" htmlType="submit" block size="large">
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </FormContainer>
    </StyledCard>
  );
};

export default UpdatePassword;