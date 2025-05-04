import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

// Colors
const colors = {
  primary: '#1976d2',
  primaryDark: '#004ba0',
  primaryLight: '#63a4ff',
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
  text: '#333',
  textLight: '#666',
  borderColor: '#ddd',
  white: '#fff',
  background: '#f5f5f5',
  buttonText: '#fff'
};

// Form Components
export const Form = styled.form`
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;
  width: 100%;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${colors.text};
`;

export const Input = styled.input`
  width: 100%;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid ${props => props.hasError ? colors.error : colors.borderColor};
  transition: border 0.2s ease, box-shadow 0.2s ease;
  background-color: ${colors.white};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

// Password Input with toggle visibility
export const PasswordInput = ({ hasError, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <PasswordContainer>
      <StyledPasswordInput 
        type={showPassword ? "text" : "password"} 
        hasError={hasError}
        {...props} 
      />
      <ToggleButton 
        type="button" 
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "Hide" : "Show"}
      </ToggleButton>
    </PasswordContainer>
  );
};

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledPasswordInput = styled(Input)`
  padding-right: 70px;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: none;
  border: none;
  padding: 0 16px;
  font-size: 14px;
  color: ${colors.primary};
  cursor: pointer;
  
  &:hover {
    color: ${colors.primaryDark};
  }
`;

export const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background-color: ${colors.primary};
  color: ${colors.buttonText};
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  &:hover {
    background-color: ${colors.primaryDark};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const ErrorMessage = styled.div`
  color: ${colors.error};
  font-size: 14px;
  margin-top: 6px;
`;

// Link text
export const LinkText = styled(Link)`
  color: ${colors.primary};
  font-size: 14px;
  text-decoration: none;
  
  &:hover {
    color: ${colors.primaryDark};
    text-decoration: underline;
  }
`;

// Layout utils
export const FlexContainer = styled.div`
  display: flex;
  ${props => props.justifyContent && `justify-content: ${props.justifyContent};`}
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
  ${props => props.direction && `flex-direction: ${props.direction};`}
  ${props => props.gap && `gap: ${props.gap}px;`}
  margin-bottom: ${props => props.marginBottom || '16px'};
`;

// Divider
export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
  
  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${colors.borderColor};
  }
  
  & > span {
    margin: 0 16px;
    color: ${colors.textLight};
    font-size: 14px;
  }
`;

// Card component
export const Card = styled.div`
  background-color: ${colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
`;

// Section title
export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${colors.text};
`;

// Badge
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 8px;
  margin-bottom: 8px;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return css`
          background-color: rgba(56, 142, 60, 0.1);
          color: ${colors.success};
          border: 1px solid rgba(56, 142, 60, 0.2);
        `;
      case 'warning':
        return css`
          background-color: rgba(245, 124, 0, 0.1);
          color: ${colors.warning};
          border: 1px solid rgba(245, 124, 0, 0.2);
        `;
      case 'error':
        return css`
          background-color: rgba(211, 47, 47, 0.1);
          color: ${colors.error};
          border: 1px solid rgba(211, 47, 47, 0.2);
        `;
      default:
        return css`
          background-color: rgba(25, 118, 210, 0.1);
          color: ${colors.primary};
          border: 1px solid rgba(25, 118, 210, 0.2);
        `;
    }
  }}
`;

// Text styles
export const Text = styled.p`
  color: ${props => props.color || colors.text};
  font-size: ${props => props.size || '16px'};
  font-weight: ${props => props.weight || 'normal'};
  margin-bottom: ${props => props.marginBottom || '16px'};
`;

export const Title = styled.h1`
  font-size: ${props => props.size || '24px'};
  font-weight: ${props => props.weight || '600'};
  color: ${props => props.color || colors.text};
  margin-bottom: ${props => props.marginBottom || '16px'};
`;

export const Subtitle = styled.h2`
  font-size: ${props => props.size || '18px'};
  font-weight: ${props => props.weight || '500'};
  color: ${props => props.color || colors.textLight};
  margin-bottom: ${props => props.marginBottom || '24px'};
`;

// Grid layout
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => props.gap || '24px'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Avatar component
export const Avatar = styled.div`
  width: ${props => props.size || '48px'};
  height: ${props => props.size || '48px'};
  border-radius: 50%;
  background-color: ${colors.primaryLight};
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: ${props => parseInt(props.size || '48') / 2.5}px;
  
  ${props => props.src && css`
    background-image: url(${props.src});
    background-size: cover;
    background-position: center;
  `}
`;

// Container for page layout
export const Container = styled.div`
  max-width: ${props => props.width || '1200px'};
  margin: 0 auto;
  padding: 0 16px;
  width: 100%;
`;

// Separator
export const Separator = styled.hr`
  border: 0;
  border-top: 1px solid ${colors.borderColor};
  margin: 24px 0;
`;