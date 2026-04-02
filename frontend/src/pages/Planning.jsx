import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getDrivers, getVehicles, getOrders, optimizeRoute } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom numbered markers
const createNumberedIcon = (number) => {
  return L.divIcon({
    html: `<div style="background-color: #2563EB; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'numbered-marker'
  });
};

const Planning = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [driversResponse, vehiclesResponse, ordersResponse] = await Promise.all([
        getDrivers(),
        getVehicles(),
        getOrders(),
      ]);

      setDrivers(driversResponse.data.filter(d => d.is_active));
      setVehicles(vehiclesResponse.data.filter(v => v.is_available));
      setOrders(ordersResponse.data.filter(o => o.status === 'pending'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderToggle = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleOptimize = async () => {
    if (!selectedDriver || !selectedVehicle || selectedOrders.length === 0) {
      alert('Please select a driver, vehicle, and at least one order');
      return;
    }

    setOptimizing(true);
    try {
      const response = await optimizeRoute({
        driver_id: parseInt(selectedDriver),
        vehicle_id: parseInt(selectedVehicle),
        order_ids: selectedOrders.map(id => parseInt(id)),
      });

      setOptimizationResult(response.data);
      
      // After successful optimization, set map center to first order's coordinates
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Route optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleOptimise = () => {
    // Mock optimisation result
    setOptimisationResult({
      stops: selectedOrders.length,
      distance: 45.2,
      time: '3h 25m'
    });
  };

  const createNumberedIcon = (number) => {
    return L.divIcon({
      html: `
        <div style="
          background: #2563EB;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${number}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'sp-failed';
      case 'medium': return 'sp-pending';
      case 'low': return 'sp-delivered';
      default: return 'sp-pending';
    }
  };

  // Mock coordinates for selected orders
  const orderCoordinates = {
    'ORD-001': [40.7128, -74.0060],
    'ORD-002': [40.7580, -73.9855],
    'ORD-003': [40.7489, -73.9680],
    'ORD-004': [40.7614, -73.9776],
    'ORD-005': [40.7282, -73.9942],
    'ORD-006': [40.730810, -73.997070]
  };

  const selectedOrderCoordinates = selectedOrders.map((orderId, index) => 
    orderCoordinates[orderId]
  ).filter(coord => coord);

  return (
    <div className="planning-layout">
      {/* Left Panel */}
      <div className="planning-left-panel">
        {/* Driver & Vehicle Section */}
        <div className="planning-section">
          <div className="planning-section-label">Driver & Vehicle</div>
          <select
            value={selectedDriver || ''}
            onChange={(e) => setSelectedDriver(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">Select driver</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.name} - {driver.vehicle}
              </option>
            ))}
          </select>
          
          {selectedDriver && (
            <div className="driver-preview" style={{ marginTop: '12px' }}>
              <div className="avatar avatar-sm">
                {drivers.find(d => d.id == selectedDriver)?.initials}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#0F172A' }}>
                  {drivers.find(d => d.id == selectedDriver)?.name}
                </div>
                <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                  {drivers.find(d => d.id == selectedDriver)?.vehicle} • Capacity: {drivers.find(d => d.id == selectedDriver)?.capacity}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Checklist */}
        <div className="orders-checklist">
          <div className="checklist-header">
            <label>Select orders</label>
            <div className="select-all-link" onClick={handleSelectAll}>
              {selectAll ? 'Deselect all' : 'Select all'}
            </div>
          </div>
          
          {orders.map((order) => (
            <div
              key={order.id}
              className={`order-item ${selectedOrders.includes(order.id) ? 'checked' : ''}`}
              onClick={() => handleOrderToggle(order.id)}
            >
              <div className={`order-checkbox ${selectedOrders.includes(order.id) ? 'checked' : ''}`}>
                {selectedOrders.includes(order.id) && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                )}
              </div>
              <div className="order-details">
                <div className="order-number">{order.number}</div>
                <div className="order-customer">{order.customer}</div>
                <div className="order-address">{order.address}</div>
              </div>
              <span className={`status-pill ${getPriorityClass(order.priority)}`}>
                {order.priority}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="planning-bottom">
          {optimisationResult && (
            <div className="optimisation-result">
              <div className="result-item">
                <div className="result-value">{optimisationResult.stops}</div>
                <div className="result-label">Stops</div>
              </div>
              <div className="result-item">
                <div className="result-value">{optimisationResult.distance} km</div>
                <div className="result-label">Distance</div>
              </div>
              <div className="result-item">
                <div className="result-value">{optimisationResult.time}</div>
                <div className="result-label">Est. time</div>
              </div>
            </div>
          )}
          <button 
            className="optimise-btn"
            onClick={handleOptimise}
            disabled={!selectedDriver || selectedOrders.length === 0}
          >
            ⭐ Optimise Route
          </button>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {selectedOrders.map((orderId, index) => {
            const coords = orderCoordinates[orderId];
            if (!coords) return null;
            
            return (
              <Marker
                key={orderId}
                position={coords}
                icon={createNumberedIcon(index + 1)}
              >
                <Popup>
                  <div style={{ padding: '4px', fontSize: '11px' }}>
                    <strong>{orders.find(o => o.id === orderId)?.number}</strong><br />
                    {orders.find(o => o.id === orderId)?.customer}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Draw route line between selected orders */}
          {selectedOrderCoordinates.length > 1 && (
            <Polyline
              positions={selectedOrderCoordinates}
              color="#2563EB"
              weight={3}
              dashArray="10, 10"
              opacity={0.7}
            />
          )}
        </MapContainer>

        {/* Bottom Info Bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #E5E7EB',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: '11px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#0F172A' }}>
              {selectedOrders.length}
            </div>
            <div style={{ color: '#9CA3AF' }}>Stops</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#0F172A' }}>
              {optimisationResult ? `${optimisationResult.distance} km` : '-- km'}
            </div>
            <div style={{ color: '#9CA3AF' }}>Total distance</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#0F172A' }}>
              {optimisationResult ? optimisationResult.time : '--:--'}
            </div>
            <div style={{ color: '#9CA3AF' }}>Est. time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#0F172A' }}>
              {selectedDriver ? drivers.find(d => d.id == selectedDriver)?.capacity : '--'}
            </div>
            <div style={{ color: '#9CA3AF' }}>Capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;
