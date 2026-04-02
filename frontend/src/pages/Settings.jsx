import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock user data
  const userData = {
    name: 'John Smith',
    email: 'john.smith@optra.com',
    role: 'admin',
    phone: '+1 234-567-8900',
    address: '123 Main St, New York, NY 10001',
    avatar: 'JS'
  };

  // Mock sessions data
  const mockSessions = [
    {
      id: 1,
      user_name: 'John Smith',
      user_email: 'john.smith@optra.com',
      user_role: 'admin',
      login_at: '2024-01-15T09:30:00Z',
      ip_address: '192.168.1.100',
      is_active: true
    },
    {
      id: 2,
      user_name: 'Sarah Johnson',
      user_email: 'sarah.j@optra.com',
      user_role: 'dispatcher',
      login_at: '2024-01-15T08:45:00Z',
      ip_address: '192.168.1.101',
      is_active: true
    },
    {
      id: 3,
      user_name: 'Mike Wilson',
      user_email: 'mike.w@optra.com',
      user_role: 'driver',
      login_at: '2024-01-15T07:15:00Z',
      ip_address: '192.168.1.102',
      is_active: false
    }
  ];
        useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'superadmin': return 'badge-black';
      case 'admin': return 'badge-blue';
      case 'dispatcher': return 'badge-purple';
      case 'driver': return 'badge-orange';
      case 'user': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const renderProfileTab = () => (
    <div>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '20px' }}>
          {userData.avatar}
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
            {userData.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span className={`badge ${getRoleBadgeClass(userData.role)}`}>
              {userData.role}
            </span>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              {userData.email}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              defaultValue={userData.name}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              defaultValue={userData.email}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              defaultValue={userData.phone}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={userData.role} style={{ width: '100%' }} disabled>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="driver">Driver</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            defaultValue={userData.address}
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <button className="btn-primary">Save Changes</button>
          <button className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div>
      <div className="settings-section">
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
          Change Password
        </h2>
        <div className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" style={{ width: '100%' }} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" style={{ width: '100%' }} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" style={{ width: '100%' }} />
          </div>
          <button className="btn-primary">Update Password</button>
        </div>
      </div>

      <div className="settings-section">
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
          Two-Factor Authentication
        </h2>
        <div className="settings-form">
          <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>🔒</span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
                2FA is currently disabled
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Enable two-factor authentication for added security
            </div>
          </div>
          <button className="btn-ghost">Enable 2FA</button>
        </div>
      </div>
    </div>
  );

  const renderActiveSessionsTab = () => (
    <div className="settings-section">
      <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
        Active Sessions
      </h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Login Time</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar avatar-sm">
                        {session.user_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
                        {session.user_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '11px', color: '#374151' }}>
                    {session.user_email || '-'}
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(session.user_role)}`}>
                      {session.user_role}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    {new Date(session.login_at).toLocaleString()}
                  </td>
                  <td style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    {session.ip_address || '-'}
                  </td>
                  <td>
                    <span className={`badge ${session.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {session.is_active ? 'Active' : 'Logged Out'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>
                  No active sessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div>
      <div className="settings-section">
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
          System Configuration
        </h2>
        <div className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" defaultValue="Optra Logistics" style={{ width: '100%' }} />
            </div>
            <div className="form-group">
              <label>Time Zone</label>
              <select style={{ width: '100%' }}>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-6 (Central Time)</option>
                <option>UTC-7 (Mountain Time)</option>
                <option>UTC-8 (Pacific Time)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Default Language</label>
              <select style={{ width: '100%' }}>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select style={{ width: '100%' }}>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>

          <button className="btn-primary">Save Settings</button>
        </div>
      </div>

      <div className="settings-section">
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
          Data Management
        </h2>
        <div className="settings-form">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-ghost">Export All Data</button>
            <button className="btn-ghost">Backup Database</button>
            <button className="btn-danger">Clear Cache</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <div className="subtitle">Manage your account and system settings</div>
        </div>
      </div>

      <div className="page-content">
        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Active Sessions
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              System
            </button>
          </div>

          {/* Content */}
          <div className="settings-content">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'sessions' && renderActiveSessionsTab()}
            {activeTab === 'system' && renderSystemTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
