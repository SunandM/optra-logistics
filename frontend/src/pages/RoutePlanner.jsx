import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

const RoutePlanner = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC

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
      if (response.data.success) {
        const selectedOrderData = orders.filter(o => selectedOrders.includes(o.id.toString()));
        const validCoords = selectedOrderData
          .filter(o => o.delivery_lat && o.delivery_lng)
          .map(o => [parseFloat(o.delivery_lat), parseFloat(o.delivery_lng)]);
        
        if (validCoords.length > 0) {
          setMapCenter(validCoords[0]);
        }
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('Route optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const getMapCenter = () => {
    if (selectedOrders.length > 0) {
      const selectedOrderData = orders.filter(o => selectedOrders.includes(o.id.toString()));
      const validCoords = selectedOrderData
        .filter(o => o.delivery_lat && o.delivery_lng)
        .map(o => [parseFloat(o.delivery_lat), parseFloat(o.delivery_lng)]);
      
      if (validCoords.length > 0) {
        return validCoords[0];
      }
    }
    return [40.7128, -74.0060]; // Default to NYC
  };

  const getMarkers = () => {
    // Show markers after successful optimization
    if (!optimizationResult?.success || selectedOrders.length === 0) return [];

    const selectedOrderData = orders.filter(o => selectedOrders.includes(o.id.toString()));
    
    return selectedOrderData
      .filter(order => order.delivery_lat && order.delivery_lng)
      .map((order, index) => ({
        id: order.id,
        position: [parseFloat(order.delivery_lat), parseFloat(order.delivery_lng)],
        popup: `
          <strong>Order #${order.order_number}</strong><br/>
          Customer: ${order.customer_name}<br/>
          Address: ${order.delivery_address}<br/>
          Priority: ${order.priority}
        `,
        color: order.priority === 'urgent' ? 'red' : order.priority === 'high' ? 'orange' : 'blue'
      }));
  };

  if (loading) {
    return <div className="loading">Loading route planner...</div>;
  }

  return (
    <div className="route-planner">
      <h1>Route Planner</h1>
      
      <div className="planner-content">
        <div className="planner-controls">
          <div className="control-section">
            <h3>Select Driver</h3>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a driver...</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.email}
                </option>
              ))}
            </select>
          </div>

          <div className="control-section">
            <h3>Select Vehicle</h3>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                </option>
              ))}
            </select>
          </div>

          <div className="control-section">
            <h3>Select Orders</h3>
            <div className="orders-list">
              {orders.map(order => (
                <label key={order.id} className="order-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id.toString())}
                    onChange={() => handleOrderToggle(order.id.toString())}
                  />
                  <span className="order-info">
                    <strong>#{order.order_number}</strong> - {order.customer_name}
                    <span className={`priority priority-${order.priority}`}>
                      {order.priority}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="btn btn-primary optimize-btn"
          >
            {optimizing ? 'Optimizing...' : 'Optimize Route'}
          </button>

          {optimizationResult && (
            <div className={`optimization-result ${optimizationResult.success ? 'success' : 'error'}`}>
              <h4>Optimization Result</h4>
              <p>{optimizationResult.message}</p>
              {optimizationResult.success && (
                <div className="route-stats">
                  <p>Route optimized successfully!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '500px', width: '100%' }}
            key={mapCenter.toString()} // Force re-render when center changes
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {getMarkers().map((marker, index) => (
              <Marker
                key={marker.id}
                position={marker.position}
              >
                <Popup>
                  <div>
                    <strong>Order #{marker.popup.match(/Order #(\d+)/)?.[1]}</strong><br/>
                    Customer: {marker.popup.match(/Customer: (.+?)<br>/)?.[1]}<br/>
                    Address: {marker.popup.match(/Address: (.+?)<br>/)?.[1]}<br/>
                    Priority: {marker.popup.match(/Priority: (.+)/)?.[1]}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
