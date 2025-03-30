import React from "react";
import { Typography, Card, Divider } from "antd";

const { Title, Paragraph } = Typography;

export const AuthLayout = ({ title, subtitle, children }) => (
  <div style={{ 
    minHeight: "100vh", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#f0f2f5",
    padding: "20px"
  }}>
    <Card 
      style={{ 
        maxWidth: "650px", // Increased from 450px to 650px
        width: "100%", 
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px", color: "#1A365D" }}>
          {title}
        </Title>
        <Paragraph type="secondary">{subtitle}</Paragraph>
        <Divider style={{ margin: "16px 0" }}>
          <div 
            style={{ 
              width: "40px", 
              height: "4px", 
              backgroundColor: "#1890ff", 
              borderRadius: "2px" 
            }} 
          />
        </Divider>
      </div>
      {children}
    </Card>
  </div>
);