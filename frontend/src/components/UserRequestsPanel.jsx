import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserRequestsPanel = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [message, setMessage] = useState('');
  
  // Form state for new request
  const [newRequest, setNewRequest] = useState({
    request_type: 'cancel_order',
    order_id: '',
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await requestsAPI.getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.order_id && newRequest.request_type !== 'assign_route') {
      setMessage('Order ID is required');
      return;
    }

    if (!newRequest.message.trim()) {
      setMessage('Message is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await requestsAPI.createRequest(newRequest);
      setNewRequest({
        request_type: 'cancel_order',
        order_id: '',
        message: '',
      });
      setShowNewRequestModal(false);
      loadRequests();
      setMessage('Request submitted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    setLoading(true);
    try {
      await requestsAPI.updateRequest(requestId, status);
      loadRequests();
      setMessage(`Request ${status} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-yellow';
      case 'approved':
        return 'badge-green';
      case 'rejected':
        return 'badge-red';
      default:
        return 'badge-grey';
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

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <>
      {/* Floating Action Button */}
      {!isAdmin && (
        <div className="floating-button" onClick={() => setIsOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
          </svg>
          {pendingCount > 0 && (
            <span className="floating-button-badge">{pendingCount}</span>
          )}
        </div>
      )}

      {/* Side Drawer */}
      {isOpen && (
        <div className="side-drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="side-drawer-header">
              <h2>{isAdmin ? 'User Requests' : 'My Requests'}</h2>
              <button className="side-drawer-close" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            {message && (
              <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                {message}
              </div>
            )}

            <div className="side-drawer-content">
              {!isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewRequestModal(true)}
                  style={{ marginBottom: '20px', width: '100%' }}
                >
                  New Request
                </button>
              )}

              {loading ? (
                <div className="loading">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="empty-state">
                  <p>No requests found</p>
                </div>
              ) : (
                <div className="requests-list">
                  {requests.map((request) => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <span className="request-type">
                          {getRequestTypeLabel(request.request_type)}
                        </span>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      {request.order_id && (
                        <div className="request-detail">
                          <label>Order ID:</label>
                          <span>#{request.order_id}</span>
                        </div>
                      )}

                      {request.message && (
                        <div className="request-message">
                          <p>{request.message}</p>
                        </div>
                      )}

                      <div className="request-footer">
                        <span className="request-date">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        {isAdmin && request.status === 'pending' && (
                          <div className="request-actions">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateRequest(request.id, 'approved')}
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUpdateRequest(request.id, 'rejected')}
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>New Request</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowNewRequestModal(false);
                  setNewRequest({
                    request_type: 'cancel_order',
                    order_id: '',
                    message: '',
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
                <label>Request Type</label>
                <select
                  value={newRequest.request_type}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, request_type: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="cancel_order">Cancel Order</option>
                  <option value="assign_order">Assign New Order</option>
                  <option value="assign_route">Assign Route</option>
                </select>
              </div>

              {newRequest.request_type !== 'assign_route' && (
                <div className="form-group">
                  <label>Order ID</label>
                  <input
                    type="number"
                    value={newRequest.order_id}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, order_id: e.target.value })
                    }
                    className="form-input"
                    placeholder="Enter order ID"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={newRequest.message}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, message: e.target.value })
                  }
                  className="form-input"
                  rows={4}
                  placeholder="Provide details about your request..."
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleCreateRequest}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowNewRequestModal(false);
                  setNewRequest({
                    request_type: 'cancel_order',
                    order_id: '',
                    message: '',
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

      <style jsx>{`
        .floating-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          background: #2563EB;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .floating-button:hover {
          background: #1D4ED8;
          transform: translateY(-2px);
        }

        .floating-button-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #EF4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .side-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1001;
          display: flex;
          justify-content: flex-end;
        }

        .side-drawer {
          width: 400px;
          background: white;
          height: 100%;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .side-drawer-header {
          padding: 20px;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          justify-content: between;
          align-items: center;
        }

        .side-drawer-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .side-drawer-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #64748B;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .side-drawer-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .request-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 15px;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .request-type {
          font-weight: 600;
          color: #1E293B;
        }

        .request-detail {
          display: flex;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .request-detail label {
          font-weight: 500;
          margin-right: 8px;
          color: #64748B;
        }

        .request-message {
          background: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .request-message p {
          margin: 0;
          font-size: 0.9rem;
          color: #374151;
        }

        .request-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .request-date {
          font-size: 0.8rem;
          color: #64748B;
        }

        .request-actions {
          display: flex;
          gap: 8px;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 0.8rem;
        }

        .btn-success {
          background: #10B981;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-danger {
          background: #EF4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-danger:hover {
          background: #DC2626;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748B;
        }

        .badge-yellow {
          background: #FEF3C7;
          color: #92400E;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .badge-green {
          background: #D1FAE5;
          color: #065F46;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .badge-red {
          background: #FEE2E2;
          color: #991B1B;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
      `}</style>
    </>
  );
};

export default UserRequestsPanel;
