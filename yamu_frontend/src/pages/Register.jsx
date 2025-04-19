import React, { useState, useEffect } from "react";
import { Form, Input, Button, Radio, Switch, Divider, Alert, Steps, Row, Col, Select, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { AuthLayout } from "../components/AuthLayout";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

// Import dropdown data services
import { fetchCountries, fetchLanguages, fetchRegions } from "../services/dropdownService";

const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Store form data from step 1
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // State for dropdown data
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [regions, setRegions] = useState([]);
  
  // Loading state for each dropdown
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(false);
  
  // Selected country for cascading region dropdown
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Fetch countries data
  useEffect(() => {
    const loadCountries = async () => {
      setCountriesLoading(true);
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (error) {
        message.error(`Failed to load countries: ${error.message}`);
        setError("Unable to load country data. Please try again later.");
      } finally {
        setCountriesLoading(false);
      }
    };
    
    loadCountries();
  }, []);

  // Fetch languages data
  useEffect(() => {
    const loadLanguages = async () => {
      setLanguagesLoading(true);
      try {
        const data = await fetchLanguages();
        setLanguages(data);
      } catch (error) {
        message.error(`Failed to load languages: ${error.message}`);
        setError(prevError => {
          return prevError 
            ? `${prevError} Also unable to load language data.` 
            : "Unable to load language data. Please try again later.";
        });
      } finally {
        setLanguagesLoading(false);
      }
    };
    
    loadLanguages();
  }, []);

  // Fetch regions data when country changes
  useEffect(() => {
    if (!selectedCountry || userType !== "GUIDE") return;
    
    const loadRegions = async () => {
      setRegionsLoading(true);
      try {
        const data = await fetchRegions(selectedCountry);
        setRegions(data);
      } catch (error) {
        message.error(`Failed to load regions: ${error.message}`);
        setError(prevError => {
          return prevError 
            ? `${prevError} Also unable to load region data.` 
            : "Unable to load region data. Please try again later.";
        });
      } finally {
        setRegionsLoading(false);
      }
    };
    
    loadRegions();
  }, [selectedCountry, userType]);

  // Handle country selection change
  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    // Clear previously selected region when country changes
    form.setFieldsValue({ expertiseCityRegion: undefined });
  };

  const onFinish = async (values) => {
    if (step === 0) {
      // Save step 1 data
      const stepOneData = form.getFieldsValue([
        "firstName",
        "lastName",
        "email",
        "password",
        "confirmPassword",
      ]);
      
      setFormData(stepOneData);
      setStep(1);
      return;
    }
    
    setLoading(true);
    setError(""); // Clear any previous errors
    
    // Combine data from both steps
    const payload = {
      ...formData,  // Data from step 1
      ...values,    // Data from step 2
      // No need for conversion, use consistent naming
      vehicleAvailability: values.vehicleAvailability ? 1 : 0,
    };
    
    try {
      await register(payload);
      message.success("Registration successful!");
      navigate('/verify-email-pending'); // Page with "Check your inbox" message


    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      // Validate fields from step 1
      const stepOneValues = await form.validateFields([
        "firstName", 
        "lastName", 
        "email", 
        "password", 
        "confirmPassword"
      ]);
      
      // Save validated values
      setFormData(stepOneValues);
      
      // Move to next step
      setStep(1);
    } catch (error) {
      // Form validation will show errors automatically
    }
  };

  // Render loading indicator
  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <AuthLayout title="Join YAMU Travel" subtitle="Start your adventure today!">
      {error && (
        <Alert
          message="Registration Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError("")}
        />
      )}

      <Steps
        current={step}
        items={[
          { title: 'Account Details' },
          { title: 'Personal Info' },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        name="register"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
        initialValues={{
          // Set initial values from stored data when returning to step 1
          ...formData
        }}
      >
        {step === 0 && (
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name" 
                name="firstName"
                rules={[
                  { required: true, message: "First Name is required" },
                  { min: 3, message: "Must be at least 3 characters" },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="First Name" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name" 
                rules={[
                  { required: true, message: "Last Name is required" },
                  { min: 3, message: "Must be at least 3 characters" },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Last Name" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="email"
                label="Email" 
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Password" 
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 8, message: "Must be at least 8 characters" },
                  {
                    pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message: "Password Must contain 1 uppercase, 1 number, 1 special character",
                  },
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Password" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Confirm password is required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Passwords must match");
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirm Password" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={nextStep}
                  size="large" 
                  block
                >
                  Continue
                </Button>
              </Form.Item>
            </Col>
          </Row>
        )}

        {step === 1 && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="role"
                label="You are joining as:"
                rules={[{ required: true, message: "User Type is required" }]}
              >
                <Radio.Group 
                  buttonStyle="solid" 
                  onChange={(e) => setUserType(e.target.value)}
                  size="large"
                >
                  <Radio.Button value="TRAVELER">Traveler</Radio.Button>
                  <Radio.Button value="GUIDE">Guide</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="contactNumber" 
                label="Contact Number"
                rules={[
                  { required: true, message: "Contact number is required" },
                  {
                    pattern: /^[0-9]{10,15}$/,
                    message: "Contact number must be 10 to 15 digits",
                  },
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="Contact Number" 
                  size="large" 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input 
                  prefix={<EnvironmentOutlined />} 
                  placeholder="Address" 
                  size="large" 
                />
              </Form.Item>
            </Col>

            {userType === "TRAVELER" && (
              <Col span={24}>
                <Form.Item
                  name="nationality"
                  label="Nationality"
                  rules={[{ required: true, message: "Nationality is required" }]}
                >
                  <Select
                    showSearch
                    placeholder={countriesLoading ? "Loading countries..." : "Select nationality"}
                    optionFilterProp="children"
                    loading={countriesLoading}
                    size="large"
                    notFoundContent={countriesLoading ? <Spin indicator={loadingIcon} /> : "No countries found"}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {countries.map(country => (
                      <Option key={country.code} value={country.code}>
                        {country.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {userType === "GUIDE" && (
              <>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: "Country is required" }]}
                  >
                    <Select
                      showSearch
                      placeholder={countriesLoading ? "Loading countries..." : "Select country"}
                      optionFilterProp="children"
                      loading={countriesLoading}
                      size="large"
                      notFoundContent={countriesLoading ? <Spin indicator={loadingIcon} /> : "No countries found"}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={handleCountryChange}
                    >
                      {countries.map(country => (
                        <Option key={country.code} value={country.code}>
                          {country.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="expertiseCityRegion"
                    label="Expertise City/Region"
                    rules={[{ required: true, message: "Expertise City/Region is required" }]}
                  >
                    <Select
                      showSearch
                      placeholder={regionsLoading ? "Loading regions..." : selectedCountry ? "Select region" : "Select country first"}
                      optionFilterProp="children"
                      loading={regionsLoading}
                      size="large"
                      disabled={!selectedCountry}
                      notFoundContent={regionsLoading ? <Spin indicator={loadingIcon} /> : "No regions found"}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {regions.map(region => (
                        <Option key={region.id} value={region.id}>
                          {region.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="language"
                    label="Languages Spoken"
                    rules={[{ required: true, message: "At least one language is required" }]}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder={languagesLoading ? "Loading languages..." : "Select languages"}
                      optionFilterProp="children"
                      loading={languagesLoading}
                      size="large"
                      notFoundContent={languagesLoading ? <Spin indicator={loadingIcon} /> : "No languages found"}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {languages.map(language => (
                        <Option key={language.code} value={language.code}>
                          {language.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item 
                    name="about"
                    label="About You">
                    <Input.TextArea 
                      placeholder="Tell us about yourself" 
                      size="large" 
                      autoSize={{ minRows: 3 }}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item 
                    name="vehicleAvailability" 
                    valuePropName="checked"
                    style={{ marginBottom: 24 }}
                  >
                    <Switch 
                      checkedChildren="Vehicle Available" 
                      unCheckedChildren="No Vehicle" 
                    />
                  </Form.Item>
                </Col>
              </>
            )}

            <Col span={24}>
              <Form.Item>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Button onClick={() => setStep(0)}>Back</Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large" 
                  >
                    Register
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>

      <Divider>
        <span style={{ color: "#666666", fontSize: "14px" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#1890ff" }}>
            Log in
          </a>
        </span>
      </Divider>
    </AuthLayout>
  );
};

export default Register;