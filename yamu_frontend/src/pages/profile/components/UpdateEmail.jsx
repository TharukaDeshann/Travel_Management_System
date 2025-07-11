import React from "react";
import { Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { updateEmail } from "../../../services/userService";
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
      
      // Show success message on successful email update
      showSuccess("Verification email sent successfully. Please check your inbox.");
      navigate("/verify-email-pending");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update email. Try again.");
    }
  };

  return (
    <StyledCard title="Update Email">
      <FormContainer>
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
      </FormContainer>
    </StyledCard>
  );
};

export default UpdateEmail;