import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Track = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'John Smith',
      initials: 'JS',
      status: 'Active',
      progress: 75,
      deliveries: 12,
      total: 16,
      location: [40.7128, -74.0060],
      active: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      initials: 'SJ',
      status: 'Active',
      progress: 45,
      deliveries: 6,
      total: 14,
      location: [40.7580, -73.9855],
      active: true
    },
    {
      id: 3,
      name: 'Mike Wilson',
      initials: 'MW',
      status: 'Idle',
      progress: 0,
      deliveries: 0,
      total: 12,
      location: [40.7489, -73.9680],
      active: false
    },
    {
      id: 4,
      name: 'Emily Davis',
      initials: 'ED',
      status: 'Active',
      progress: 90,
      deliveries: 15,
      total: 16,
      location: [40.7614, -73.9776],
      active: true
    },
    {
      id: 5,
      name: 'Robert Brown',
      initials: 'RB',
      status: 'Active',
      progress: 30,
      deliveries: 4,
      total: 13,
      location: [40.7282, -73.9942],
      active: true
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      initials: 'LA',
      status: 'Offline',
      progress: 0,
      deliveries: 0,
      total: 0,
      location: [40.730810, -73.997070],
      active: false
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = drivers.filter(d => d.active).length;
  const idleCount = drivers.filter(d => d.status === 'Idle').length;
  const totalStops = drivers.reduce((sum, d) => sum + d.total, 0);

  const createCustomIcon = (driver) => {
    const color = driver.active ? '#2563EB' : driver.status === 'Idle' ? '#F59E0B' : '#9CA3AF';
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ${driver.active ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${driver.initials}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
  };

  return (
    <div className="track-layout">
      {/* Left Panel */}
      <div className="track-left-panel">
        {/* Header */}
        <div className="track-header">
          <div className="track-title">
            Live Fleet
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </div>
          </div>
          <div className="track-subtitle">{drivers.length} drivers active today</div>
        </div>

        {/* Search */}
        <div className="track-search">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Driver List */}
        <div className="driver-list">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className={`driver-card ${selectedDriver?.id === driver.id ? 'selected' : ''}`}
              onClick={() => handleDriverClick(driver)}
            >
              <div className="driver-card-header">
                <div className="driver-avatar">{driver.initials}</div>
                <div className="driver-info">
                  <div className="driver-name">{driver.name}</div>
                  <div className="driver-status">{driver.status}</div>
                </div>
                <span className={`status-pill ${driver.active ? 'sp-transit' : driver.status === 'Idle' ? 'sp-pending' : 'sp-failed'}`}>
                  {driver.status}
                </span>
              </div>
              <div className="driver-progress">
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${driver.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="driver-stats">
                <span>{driver.deliveries}/{driver.total} stops</span>
                <span>{driver.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="track-footer">
          <div className="footer-stat">
            <div className="footer-stat-value">{activeCount}</div>
            <div className="footer-stat-label">Active</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-value">{idleCount}</div>
            <div className="footer-stat-label">Idle</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-value">{totalStops}</div>
            <div className="footer-stat-label">Total stops</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="track-right-panel">
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredDrivers.map((driver) => (
            <Marker
              key={driver.id}
              position={driver.location}
              icon={createCustomIcon(driver)}
              eventHandlers={{
                click: () => handleDriverClick(driver)
              }}
            >
              <Popup>
                <div style={{ padding: '8px' }}>
                  <strong>{driver.name}</strong><br />
                  Status: {driver.status}<br />
                  Progress: {driver.deliveries}/{driver.total} stops
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Stats Card */}
        <div className="map-stats-card">
          <div className="map-stat">
            <div className="map-stat-value">{activeCount}</div>
            <div className="map-stat-label">Active Drivers</div>
          </div>
          <div className="map-stat">
            <div className="map-stat-value">{totalStops}</div>
            <div className="map-stat-label">Total Stops Today</div>
          </div>
          <div className="map-stat">
            <div className="map-stat-value">
              {Math.round((drivers.reduce((sum, d) => sum + d.deliveries, 0) / totalStops) * 100)}%
            </div>
            <div className="map-stat-label">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
