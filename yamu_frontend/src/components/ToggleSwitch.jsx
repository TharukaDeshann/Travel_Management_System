import React from "react";
import { Form, Switch } from "antd";

export const ToggleSwitch = ({ label, checked, onChange }) => {
  // Note: This component is no longer needed when using Ant Design
  // It's included here for reference only, showing how it would be converted
  
  return (
    <Form.Item label={label} style={{ marginBottom: 0 }}>
      <Switch checked={checked} onChange={onChange} />
    </Form.Item>
  );
};

// NOTE: With Ant Design's Form component, you typically don't need this wrapper
// component as Form.Item handles the layout and Switch component handles the toggle.
// This file is kept for reference only.