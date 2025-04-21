import React from "react";
import { Form, Input } from "antd";

export const FormInput = ({ formik, id, icon: Icon, placeholder, type = "text", error }) => {
  // Note: This component is no longer needed when using Ant Design
  // It's included here for reference only, showing how it would be converted
  
  const InputComponent = type === "password" ? Input.Password : Input;
  
  return (
    <Form.Item 
      name={id}
      validateStatus={error ? "error" : ""}
      help={error}
    >
      <InputComponent
        prefix={<Icon />}
        placeholder={placeholder}
        size="large"
      />
    </Form.Item>
  );
};

// NOTE: With Ant Design's Form component, you typically don't need this wrapper
// component as Form.Item handles validation and input display.
// This file is kept for reference only.