import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { requestsAPI } from '../services/api';
import UserRequestsPanel from './UserRequestsPanel';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState('');
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showRequestsDrawer, setShowRequestsDrawer] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (isAdmin) {
      loadPendingRequests();
      // Refresh pending requests count every 30 seconds
      const interval = setInterval(loadPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const loadPendingRequests = async () => {
    try {
      const requests = await requestsAPI.getRequests();
      const pending = requests.filter(r => r.status === 'pending').length;
      setPendingRequests(pending);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const mainNavItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      )
    },
    { 
      path: '/planning', 
      label: 'Planning', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    },
    { 
      path: '/track', 
      label: 'Track & Trace', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      )
    },
    { 
      path: '/orders', 
      label: 'Orders', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        </svg>
      )
    },
  ];

  const analyticsNavItems = [
    ...(user?.role !== 'user' && user?.role !== 'driver' ? [{
      path: '/reports', 
      label: 'Reports', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10"/>
          <path d="M12 20V4"/>
          <path d="M6 20v-6"/>
        </svg>
      )
    }] : []),
    ...(user?.role !== 'dispatcher' && user?.role !== 'user' && user?.role !== 'driver' ? [{
      path: '/settings', 
      label: 'Settings', 
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/>
        </svg>
      )
    }] : []),
  ].filter(Boolean);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const NavItem = ({ item }) => (
    <button
      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
      onClick={() => navigate(item.path)}
    >
      {item.icon}
      <span>{item.label}</span>
      {item.path === '/settings' && pendingRequests > 0 && (
        <span className="nav-badge">{pendingRequests}</span>
      )}
    </button>
  );

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark"></div>
            <span className="sidebar-logo-text">Route<span>Optima</span></span>
          </div>
          <div className="sidebar-search">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="#4B5563" strokeWidth="1.2"/>
              <path d="M8 8l2 2" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search anything..." />
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {mainNavItems.map(item => (
            <NavItem key={item.path} item={item} />
          ))}
          <div className="sidebar-section-label">Analytics</div>
          {analyticsNavItems.map(item => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-user" onClick={() => navigate('/profile')}>
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.email}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5l3 3 3-3" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Admin Requests Drawer */}
      {showRequestsDrawer && (
        <div className="side-drawer-overlay" onClick={() => setShowRequestsDrawer(false)}>
          <div className="side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="side-drawer-header">
              <h2>Pending Requests</h2>
              <button
                className="side-drawer-close"
                onClick={() => setShowRequestsDrawer(false)}
              >
                ×
              </button>
            </div>
            <div className="side-drawer-content">
              <AdminRequestsContent 
                onUpdate={loadPendingRequests} 
                onClose={() => setShowRequestsDrawer(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Standard User Requests Panel */}
      {!isAdmin && <UserRequestsPanel />}
    </>
  );
};

// Admin Requests Content Component
const AdminRequestsContent = ({ onUpdate, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await requestsAPI.getRequests();
      setRequests(data.filter(r => r.status === 'pending'));
    } catch (error) {
      setMessage(error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    setLoading(true);
    try {
      await requestsAPI.updateRequest(requestId, status);
      setMessage(`Request ${status} successfully`);
      loadRequests();
      onUpdate();
      setTimeout(() => {
        setMessage('');
        if (requests.length <= 1) {
          onClose();
        }
      }, 2000);
    } catch (error) {
      setMessage(error.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'cancel_order':
        return 'Cancel Order';
      case 'assign_order':
        return 'Assign New Order';
      case 'assign_route':
        return 'Assign Route';
      default:
        return type;
    }
  };

  return (
    <>
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <p>No pending requests</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <span className="request-type">
                  {getRequestTypeLabel(request.request_type)}
                </span>
                <span className="request-status status-pending">
                  <span className="status-dot"></span>
                  Pending
                </span>
              </div>

              {request.order_id && (
                <div className="request-detail">
                  <label>Order ID:</label>
                  <span>#{request.order_id}</span>
                </div>
              )}

              <div className="request-detail">
                <label>User:</label>
                <span>{request.user?.name || 'Unknown'}</span>
              </div>

              {request.message && (
                <div className="request-message">
                  <p>{request.message}</p>
                </div>
              )}

              <div className="request-footer">
                <span className="request-date">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
                <div className="request-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateRequest(request.id, 'approved')}
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleUpdateRequest(request.id, 'rejected')}
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Sidebar;
