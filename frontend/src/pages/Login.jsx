import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: enter contact, 2: enter OTP, 3: reset password
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handlers
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(resetEmail, resetPhone, deliveryMethod);
      setResetStep(2);
      setTimerActive(true);
      startOtpTimer();
    } catch (error) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.verifyOTP(resetEmail, resetPhone, otpCode);
      setResetStep(3);
      setTimerActive(false);
    } catch (error) {
      setError(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(resetEmail, resetPhone, otpCode, newPassword);
      // Reset form and show login
      setShowForgotPassword(false);
      setResetStep(1);
      setResetEmail('');
      setResetPhone('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setTimerActive(false);
      setOtpTimer(300);
    } catch (error) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const startOtpTimer = () => {
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail('');
    setResetPhone('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setTimerActive(false);
    setOtpTimer(300);
    setError('');
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-logo">RouteOptima</h1>
            <p className="login-subtitle">Reset your password</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          {resetStep === 1 && (
            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="form-group">
                <label>Delivery Method</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="form-input"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  {deliveryMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={deliveryMethod === 'email' ? 'email' : 'tel'}
                  value={deliveryMethod === 'email' ? resetEmail : resetPhone}
                  onChange={(e) => 
                    deliveryMethod === 'email' 
                      ? setResetEmail(e.target.value)
                      : setResetPhone(e.target.value)
                  }
                  placeholder={deliveryMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForgotPassword}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Back to Login
              </button>
            </form>
          )}

          {resetStep === 2 && (
            <form onSubmit={handleVerifyOTP} className="login-form">
              <div className="form-group">
                <label>Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                />
              </div>

              {timerActive && (
                <div style={{ textAlign: 'center', marginBottom: '15px', color: '#64748B' }}>
                  OTP expires in: <strong>{formatTime(otpTimer)}</strong>
                </div>
              )}

              {!timerActive && (
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setOtpTimer(300);
                      setTimerActive(true);
                      startOtpTimer();
                      handleForgotPassword({ preventDefault: () => {} });
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              <button type="submit" className="login-button" disabled={loading || otpCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForgotPassword}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Back to Login
              </button>
            </form>
          )}

          {resetStep === 3 && (
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForgotPassword}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 9a3 3 0 116 6M9 9h6m-6 0v6m6-6a3 3 0 100 6m0-6v6"/>
            </svg>
          </div>
          <div className="login-logo-text">Route<span className="optima">Optima</span></div>
        </div>
        <div className="login-tagline">
          Smart Logistics Management
        </div>
        <ul className="login-features">
          <li>Real-time route optimization</li>
          <li>Advanced fleet management</li>
          <li>Comprehensive analytics</li>
          <li>Multi-user collaboration</li>
        </ul>
      </div>

      <div className="login-right">
        {showForgotPassword ? (
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Reset Password</h2>
              <p className="login-subtitle">Follow the steps to reset your password</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            {resetStep === 1 && (
              <form onSubmit={handleForgotPassword} className="login-form">
                <div className="form-group">
                  <label>Delivery Method</label>
                  <select 
                    value={deliveryMethod} 
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="form-input"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{deliveryMethod === 'email' ? 'Email Address' : 'Phone Number'}</label>
                  <input
                    type={deliveryMethod === 'email' ? 'email' : 'tel'}
                    value={deliveryMethod === 'email' ? resetEmail : resetPhone}
                    onChange={(e) => deliveryMethod === 'email' ? setResetEmail(e.target.value) : setResetPhone(e.target.value)}
                    placeholder={deliveryMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    required
                    className="form-input"
                  />
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>

                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={resetForgotPassword}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  Back to Login
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="login-form">
                <div className="form-group">
                  <label>Enter 6-digit OTP</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                  />
                </div>

                {timerActive && (
                  <div className="otp-timer">
                    OTP expires in: <strong>{formatTime(otpTimer)}</strong>
                  </div>
                )}

                {!timerActive && (
                  <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <button 
                      type="button" 
                      className="btn btn-ghost"
                      onClick={() => {
                        setOtpTimer(300);
                        setTimerActive(true);
                        startOtpTimer();
                        handleForgotPassword({ preventDefault: () => {} });
                      }}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}

                <button type="submit" className="login-button" disabled={loading || otpCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={resetForgotPassword}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  Back to Login
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} className="login-form">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={resetForgotPassword}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your RouteOptima account</p>
            </div>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-links">
              <button 
                type="button" 
                className="login-link"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
