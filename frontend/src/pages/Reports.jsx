import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('today');
  const [uploadError, setUploadError] = useState('');

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.endsWith('.xlsx')) {
      setUploadError('Only .xlsx files are allowed');
      return;
    }

    setUploadError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful:', response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { name: 'John Smith', orders: 45, delivered: 42, failed: 3, avgTime: '2h 10m' },
    { name: 'Sarah Johnson', orders: 38, delivered: 35, failed: 3, avgTime: '2h 25m' },
    { name: 'Mike Wilson', orders: 52, delivered: 48, failed: 4, avgTime: '2h 05m' },
    { name: 'Emily Davis', orders: 41, delivered: 39, failed: 2, avgTime: '2h 30m' }
  ];

  const ordersData = [
    { date: '2024-01-15', total: 45, delivered: 42, failed: 3, pending: 0 },
    { date: '2024-01-14', total: 38, delivered: 35, failed: 2, pending: 1 },
    { date: '2024-01-13', total: 52, delivered: 48, failed: 3, pending: 1 },
    { date: '2024-01-12', total: 41, delivered: 39, failed: 1, pending: 1 },
    { date: '2024-01-11', total: 35, delivered: 32, failed: 2, pending: 1 }
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      console.log('Upload successful:', response.data);
      // Refresh reports data
    }).catch(error => {
      console.error('Upload failed:', error);
    }).finally(() => {
      setLoading(false);
    });
  };

  const renderOverviewTab = () => (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            📦
          </div>
          <div className="summary-content">
            <div className="summary-value">{overviewData.totalOrders}</div>
            <div className="summary-label">Total Orders</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
            ✅
          </div>
          <div className="summary-content">
            <div className="summary-value">{overviewData.delivered}</div>
            <div className="summary-label">Delivered</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            ❌
          </div>
          <div className="summary-content">
            <div className="summary-value">{overviewData.failed}</div>
            <div className="summary-label">Failed</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon" style={{ background: '#FEF3C7', color: '#92400E' }}>
            ⏳
          </div>
          <div className="summary-content">
            <div className="summary-value">{overviewData.pending}</div>
            <div className="summary-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Delivery Status Chart */}
        <div className="chart-card">
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
            Delivery Status
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              Delivery status chart
            </div>
          </div>
        </div>

        {/* Daily Orders Chart */}
        <div className="chart-card">
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
            Daily Orders
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
              Daily orders chart
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Avg Delivery Time</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>{overviewData.avgDeliveryTime}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Total Distance</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>{overviewData.totalDistance}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Completion Rate</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>{overviewData.completionRate}%</div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div>
      {/* Performance Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Total Drivers</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>{performanceData.length}</div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Avg Orders/Driver</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>
            {Math.round(performanceData.reduce((sum, d) => sum + d.orders, 0) / performanceData.length)}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Best Performance</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>
            {Math.max(...performanceData.map(d => (d.delivered / d.orders) * 100)).toFixed(1)}%
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Avg Time</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>2h 18m</div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Total Orders</th>
              <th>Delivered</th>
              <th>Failed</th>
              <th>Success Rate</th>
              <th>Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((driver, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar avatar-sm">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
                      {driver.name}
                    </span>
                  </div>
                </td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{driver.orders}</td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{driver.delivered}</td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{driver.failed}</td>
                <td>
                  <span className="metric-badge">
                    {((driver.delivered / driver.orders) * 100).toFixed(1)}%
                  </span>
                </td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{driver.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div>
      {/* Orders Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Total Orders</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>
            {ordersData.reduce((sum, d) => sum + d.total, 0)}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Delivered</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>
            {ordersData.reduce((sum, d) => sum + d.delivered, 0)}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Failed</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>
            {ordersData.reduce((sum, d) => sum + d.failed, 0)}
          </div>
        </div>
        <div className="metric-card">
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Pending</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A' }}>
            {ordersData.reduce((sum, d) => sum + d.pending, 0)}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Orders</th>
              <th>Delivered</th>
              <th>Failed</th>
              <th>Pending</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map((day, index) => (
              <tr key={index}>
                <td style={{ fontSize: '11px', color: '#374151' }}>{day.date}</td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{day.total}</td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{day.delivered}</td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{day.failed}</td>
                <td style={{ fontSize: '11px', color: '#374151' }}>{day.pending}</td>
                <td>
                  <span className="metric-badge">
                    {((day.delivered / day.total) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <div className="subtitle">Analytics and insights</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={handleExport} disabled={loading}>
            {loading ? 'Exporting...' : '📥 Download'}
          </button>
          <label className="btn-upload">
            📤 Upload
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="page-content">
        {/* Tab Filters */}
        <div className="tab-filter-wrapper">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>

        {/* Period Filter */}
        <div className="tab-filter-wrapper" style={{ marginTop: '16px', marginBottom: '24px' }}>
          <button
            className={`tab-btn ${period === 'today' ? 'active' : ''}`}
            onClick={() => setPeriod('today')}
          >
            Today
          </button>
          <button
            className={`tab-btn ${period === 'this_week' ? 'active' : ''}`}
            onClick={() => setPeriod('this_week')}
          >
            This week
          </button>
          <button
            className={`tab-btn ${period === 'this_month' ? 'active' : ''}`}
            onClick={() => setPeriod('this_month')}
          >
            This month
          </button>
          <button
            className={`tab-btn ${period === 'custom' ? 'active' : ''}`}
            onClick={() => setPeriod('custom')}
          >
            Custom
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'orders' && renderOrdersTab()}
        <div className="report-section-title">Dispatch summary</div>
        <table className="report-table">
          <thead><tr><th>Period</th><th>Total Dispatches</th><th>Avg Stops Per Route</th><th>Total Distance (km)</th></tr></thead>
          <tbody>
            <tr><td>Today</td><td>{data.dispatches?.today ?? 0}</td><td>—</td><td>—</td></tr>
            <tr><td>This Week</td><td>{data.dispatches?.this_week ?? 0}</td><td>—</td><td>—</td></tr>
            <tr><td>This Month</td><td>{data.dispatches?.this_month ?? 0}</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <div className="report-section-title">Delivery status</div>
        <table className="report-table">
          <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
          <tbody>
            <tr><td><span className="status-pill sp-done">Delivered</span></td><td>{data.deliveries?.delivered ?? 0}</td><td>{data.parcels?.total_today ? Math.round((data.deliveries?.delivered / data.parcels?.total_today) * 100) : 0}%</td></tr>
            <tr><td><span className="status-pill sp-pending">Yet to deliver</span></td><td>{data.deliveries?.yet_to_deliver ?? 0}</td><td>{data.parcels?.total_today ? Math.round((data.deliveries?.yet_to_deliver / data.parcels?.total_today) * 100) : 0}%</td></tr>
            <tr><td><span className="status-pill sp-failed">Cancelled</span></td><td>{data.deliveries?.cancelled ?? 0}</td><td>{data.parcels?.total_today ? Math.round((data.deliveries?.cancelled / data.parcels?.total_today) * 100) : 0}%</td></tr>
            <tr><td><span className="status-pill sp-transit">Reassigned</span></td><td>{data.deliveries?.reassigned ?? 0}</td><td>{data.parcels?.total_today ? Math.round((data.deliveries?.reassigned / data.parcels?.total_today) * 100) : 0}%</td></tr>
            <tr style={{fontWeight:600}}><td>Total</td><td>{data.parcels?.total_today ?? 0}</td><td>100%</td></tr>
          </tbody>
        </table>
      </div>

      <div className="report-section">
        <div className="report-section-title">Driver summary — today</div>
        <table className="report-table">
          <thead><tr><th>Driver</th><th>Total Parcels</th><th>Delivered</th><th>Pending</th><th>Cancelled</th><th>Completion %</th></tr></thead>
          <tbody>
            {data.drivers?.parcels_per_driver?.length > 0
              ? data.drivers.parcels_per_driver.map(d => (
                  <tr key={d.driver_id}>
                    <td>{d.driver_name}</td>
                    <td>{d.total_parcels}</td>
                    <td>{d.delivered}</td>
                    <td>{d.pending}</td>
                    <td>{d.cancelled ?? 0}</td>
                    <td>{d.total_parcels > 0 ? Math.round((d.delivered / d.total_parcels) * 100) : 0}%</td>
                  </tr>
                ))
              : <tr><td colSpan={6} style={{textAlign:'center', color:'#9CA3AF'}}>No driver data for today</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
