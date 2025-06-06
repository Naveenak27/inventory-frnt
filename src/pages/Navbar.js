import React, { useContext, useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import AuthContext from '../pages/AuthContext';

const { Header } = Layout;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleLogout = () => {
    logout();
    closeDrawer();
  };

  return (
    <>
      <Header 
        style={{ 
          position: 'fixed', 
          zIndex: 1000, 
          width: '100%',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Desktop Layout */}
        <div className="desktop-nav" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: 'white', marginRight: '20px', fontSize: '18px', fontWeight: 'bold' }}>
              Notes App
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
            <span style={{ marginRight: '10px' }}>Welcome, {user?.username}!</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              style={{ color: 'white' }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="mobile-nav" style={{ 
          display: 'none',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            Notes App
          </div>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={showDrawer}
            style={{ color: 'white' }}
          />
        </div>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={250}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <strong>Welcome, {user?.username}!</strong>
          </div>
          
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ 
              textAlign: 'left', 
              justifyContent: 'flex-start',
              color: '#ff4d4f'
            }}
          >
            Logout
          </Button>
        </div>
      </Drawer>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav {
            display: flex !important;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .ant-layout-header {
            padding: 0 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;