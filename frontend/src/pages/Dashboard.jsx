import React, { useState, useEffect } from 'react';
import { getOrders, getDrivers, getVehicles } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeDrivers: 0,
    routesPlanned: 0,
    pendingOrders: 0,
    completedToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersResponse, driversResponse, vehiclesResponse] = await Promise.all([
        getOrders(),
        getDrivers(),
        getVehicles(),
      ]);

      const orders = ordersResponse.data;
      const drivers = driversResponse.data;
      const vehicles = vehiclesResponse.data;

      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );

      setStats({
        totalOrders: orders.length,
        activeDrivers: drivers.filter(driver => driver.is_active).length,
        routesPlanned: vehicles.filter(vehicle => vehicle.is_available).length,
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        completedToday: todayOrders.filter(order => order.status === 'completed').length,
      });

      // Get recent orders (last 10)
      const sortedOrders = orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      
      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend, trendValue }) => (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: icon.color }}>
        {icon.svg}
      </div>
      {trend && (
        <div className={`kpi-trend trend-${trend}`}>
          {trendValue}
        </div>
      )}
      <div className="kpi-number">{value}</div>
      <div className="kpi-label">{title}</div>
    </div>
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', label: 'Pending' },
      'in-progress': { class: 'status-in-transit', label: 'In Transit' },
      completed: { class: 'status-delivered', label: 'Delivered' },
      failed: { class: 'status-failed', label: 'Failed' },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`status-pill ${statusInfo.class}`}>
        <span className="status-dot"></span>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="page-container">
      <div className="kpi-grid">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={{
            color: '#3B82F6',
            svg: (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            )
          }}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Active Drivers"
          value={stats.activeDrivers}
          icon={{
            color: '#10B981',
            svg: (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            )
          }}
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          title="Routes Planned"
          value={stats.routesPlanned}
          icon={{
            color: '#F59E0B',
            svg: (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            )
          }}
          trend="down"
          trendValue="-3%"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={{
            color: '#EF4444',
            svg: (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            )
          }}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Recent Orders</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.delivery_address}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
