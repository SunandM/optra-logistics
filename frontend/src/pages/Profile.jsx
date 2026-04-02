import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await usersAPI.getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      await usersAPI.updateUser(user.id, formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await usersAPI.changeMyPassword(
        passwordData.current_password,
        passwordData.new_password
      );
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setMessage('Password changed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'superadmin';

  if (!profile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="page-container">
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{profile.name}</h2>
          <div className="profile-email">{profile.email}</div>
          <div className="profile-phone">{profile.phone || 'No phone number'}</div>
        </div>
        <div className="profile-actions">
          {canEdit && !editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <div className="info-label">Role</div>
          <div className="info-value">
            <span className={`role-badge role-${profile.role}`}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Status</div>
          <div className="info-value">
            <span className={`status-pill ${profile.is_active ? 'status-delivered' : 'status-failed'}`}>
              <span className="status-dot"></span>
              {profile.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Last Login</div>
          <div className="info-value">
            {profile.last_login
              ? new Date(profile.last_login).toLocaleString()
              : 'Never'}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">Member Since</div>
          <div className="info-value">
            {new Date(profile.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {editing && (
        <div className="card">
          <div className="card-header">
            <h2>Edit Profile</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: profile.name,
                    phone: profile.phone || '',
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                  setMessage('');
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                  {message}
                </div>
              )}

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, current_password: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  className="form-input"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  className="form-input"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                  setMessage('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
