import React, {useState} from "react";
import { Form, Input, Button, Modal } from "antd";
import { updateEmail } from "../../../services/userService";
import { useNotification } from "../../../hooks/useNotification";
import styled from "styled-components";
import { set } from "date-fns";

// Styled components
const FormContainer = styled.div`
  .ant-form-item-label {
    font-weight: 500;
  }
  .ant-btn-primary {
    height: 48px;
    font-weight: 600;
  }
`;

const UpdateEmailModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await updateEmail({ newEmail: values.newEmail });
      if (response.status !== 200) throw new Error("Failed to update email");

      showSuccess("Email updated successfully. Verify your new email to activate the email.");
      setLoading(false);
      form.resetFields();
      setTimeout(() => {
        onClose(); // Close the modal after 5 seconds
      }, 5000);
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to update email. Try again."
      );
    }
  };

  return (
    <Modal
      title="Update Email"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
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
            <Button  type="primary" htmlType="submit" block size="large" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Email"}
              
              {loading && <span className="loading-spinner"></span>}
            </Button>
          </Form.Item>
        </Form>
      </FormContainer>
    </Modal>
  );
};

export default UpdateEmailModal;
