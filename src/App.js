import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin, message } from 'antd';
import NotesPage from './pages/NotesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './pages/Navbar';
import AuthContext from './pages/AuthContext';
import './App.css';

const { Content } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    message.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Layout className="layout">
          {user && <Navbar />}
          <Content >
            <div className="site-layout-content">
              <Routes>
                <Route
                  path="/"
                  element={user ? <NotesPage /> : <Navigate to="/login" />}
                />
                <Route
                  path="/login"
                  element={!user ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/register"
                  element={!user ? <RegisterPage /> : <Navigate to="/" />}
                />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;