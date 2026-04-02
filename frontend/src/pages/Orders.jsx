import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [podImage, setPodImage] = useState(null);
  const [podPreview, setPodPreview] = useState(null);

  // Mock data
  const mockOrders = [
    { 
      id: 'ORD-001', 
      number: 'ORD-001', 
      customer: 'John Doe', 
      address: '123 Main St, NYC',
      status: 'delivered', 
      priority: 'high',
      driver: 'John Smith',
      created: '2024-01-15 09:30',
      estimated: '2024-01-15 14:00'
    },
    { 
      id: 'ORD-002', 
      number: 'ORD-002', 
      customer: 'Sarah Smith', 
      address: '456 Oak Ave, Brooklyn',
      status: 'pending', 
      priority: 'medium',
      driver: 'Sarah Johnson',
      created: '2024-01-15 10:15',
      estimated: '2024-01-15 16:00'
    },
    { 
      id: 'ORD-003', 
      number: 'ORD-003', 
      customer: 'Robert Johnson', 
      address: '789 Pine Rd, Queens',
      status: 'in-transit', 
      priority: 'low',
      driver: 'Mike Wilson',
      created: '2024-01-15 11:00',
      estimated: '2024-01-15 15:30'
    }
  ];

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    delivery_lat: '',
    delivery_lng: '',
    package_weight: '',
    package_dimensions: '',
    special_instructions: ''
  });

  useEffect(() => {
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, priorityFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered': return 'sp-delivered';
      case 'in-transit': return 'sp-pending';
      case 'pending': return 'sp-failed';
      default: return 'sp-pending';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'sp-failed';
      case 'medium': return 'sp-pending';
      case 'low': return 'sp-delivered';
      default: return 'sp-pending';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only image files are allowed');
      return;
    }

    setPodImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPodPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setShowNewOrderModal(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <div className="subtitle">{orders.length} total orders</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost">Filter</button>
          <button className="btn-ghost">Import</button>
          <button 
            className="btn-primary"
            onClick={() => setShowNewOrderModal(true)}
          >
            New Order
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Summary Cards */}
        <div className="orders-summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              📦
            </div>
            <div className="summary-content">
              <div className="summary-value">{orders.length}</div>
              <div className="summary-label">Total Orders</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
              ✅
            </div>
            <div className="summary-content">
              <div className="summary-value">{orders.filter(o => o.status === 'delivered').length}</div>
              <div className="summary-label">Delivered</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#FEF3C7', color: '#92400E' }}>
              🚚
            </div>
            <div className="summary-content">
              <div className="summary-value">{orders.filter(o => o.status === 'in-transit').length}</div>
              <div className="summary-label">In Transit</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
              ⏳
            </div>
            <div className="summary-content">
              <div className="summary-value">{orders.filter(o => o.status === 'pending').length}</div>
              <div className="summary-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <div className="filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Driver</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '500' }}>{order.number}</td>
                  <td>{order.customer}</td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{order.address}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${getPriorityClass(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td>{order.driver}</td>
                  <td style={{ fontSize: '12px', color: '#6B7280' }}>{order.created}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn-small btn-edit"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetailModal(true);
                        }}
                      >
                        👁️
                      </button>
                      <button className="btn-small btn-edit">
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ 
          padding: '10px 14px', 
          borderTop: '1px solid #F3F4F6', 
          display: 'flex', 
          justifyContent: 'space-between', 
          background: '#FAFAFA',
          fontSize: '11px',
          color: '#9CA3AF'
        }}>
          <span>Showing 1-{filteredOrders.length} of {filteredOrders.length} results</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-small btn-edit">Previous</button>
            <button className="btn-small btn-edit">Next</button>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Order</h3>
              <button 
                className="modal-close"
                onClick={() => setShowNewOrderModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Phone</label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Customer Email</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Package Weight (kg)</label>
                    <input
                      type="number"
                      step="any"
                      name="package_weight"
                      value={formData.package_weight}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Package Dimensions (L×W×H cm)</label>
                    <input
                      type="text"
                      name="package_dimensions"
                      value={formData.package_dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g., 30x20x15"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special handling instructions..."
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowNewOrderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
