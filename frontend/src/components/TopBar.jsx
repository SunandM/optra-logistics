import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, subtitle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="top-bar">
      <div className="page-title-section">
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      
      <div className="top-bar-actions">
        <button 
          className="notification-bell"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="notification-dot"></span>
        </button>
        
        <button 
          className="btn btn-ghost"
          onClick={handleProfileClick}
        >
          Profile
        </button>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="notifications-close"
            >
              ×
            </button>
          </div>
          <div className="notifications-content">
            <div className="notification-item">
              <div className="notification-dot success"></div>
              <div className="notification-content">
                <div className="notification-text">Order #1234 completed</div>
                <div className="notification-meta">2 minutes ago</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-dot info"></div>
              <div className="notification-content">
                <div className="notification-text">New route assigned to Driver John</div>
                <div className="notification-meta">15 minutes ago</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-dot error"></div>
              <div className="notification-content">
                <div className="notification-text">Vehicle #2 maintenance required</div>
                <div className="notification-meta">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
