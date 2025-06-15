import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Use HTTPS and ensure the URL matches exactly what's in your CORS config
      const response = await fetch('https://ren-uncw.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add this if your backend requires it
          'Accept': 'application/json'
        },
        body: JSON.stringify(values),
        credentials: 'include',
        mode: 'cors' // Explicitly set CORS mode
      });
  
      // First check if response exists at all
      if (!response) {
        throw new Error('No response from server');
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
  
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',width: '100%', height: '90vh'}}>
      <Card title="Register" style={{ width: 300 }}>
        <Form
          name="register_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login now</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;