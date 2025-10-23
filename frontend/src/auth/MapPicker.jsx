import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FaExpand, FaCompress, FaMapMarkerAlt } from 'react-icons/fa';
// Import marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapPicker = ({ onLocationSelect, initialLocation, userRole = 'vendor' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(initialLocation || [28.6139, 77.2090]); // Default to Delhi
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);

  // Update position when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  // Handle map click to set marker position
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        setPosition(newPosition);
        onLocationSelect(newPosition);
      },
    });
    return null;
  };

  // Handle marker drag
  const handleMarkerDrag = (e) => {
    const newPosition = [e.target.getLatLng().lat, e.target.getLatLng().lng];
    setPosition(newPosition);
    onLocationSelect(newPosition);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getLocationType = () => {
    return userRole === 'supplier' ? 'Warehouse' : 'Shop';
  };

  return (
    <div className="w-full">
      {/* Map Toggle Button */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          {getLocationType()} Location
        </label>
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              <FaCompress className="w-3 h-3" />
              Minimize Map
            </>
          ) : (
            <>
              <FaExpand className="w-3 h-3" />
              Expand Map
            </>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div 
        className={`relative bg-gray-100 rounded-lg border-2 border-gray-200 transition-all duration-300 ${
          isExpanded 
            ? 'h-96 w-full' 
            : 'h-48 w-full'
        }`}
      >
        {mapError ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Map Error</div>
              <div className="text-sm">{mapError}</div>
              <button 
                onClick={() => setMapError(null)}
                className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <MapContainer
              center={position}
              zoom={isExpanded ? 15 : 12}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              ref={mapRef}
              whenReady={() => setIsMapReady(true)}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler />
              <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                  dragend: handleMarkerDrag,
                }}
              />
            </MapContainer>

            {/* Map Instructions Overlay */}
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 shadow-sm z-[400]">
              <FaMapMarkerAlt className="inline w-3 h-3 mr-1" />
              Click on map or drag marker to set {getLocationType().toLowerCase()} location
            </div>

            {/* Coordinates Display */}
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 shadow-sm z-[400]">
              <div>Lat: {position[0].toFixed(6)}</div>
              <div>Lng: {position[1].toFixed(6)}</div>
            </div>
          </>
        )}
      </div>

      {/* Location Summary */}
      <div className="mt-2 text-xs text-gray-500">
        {getLocationType()} will be located at: {position[0].toFixed(4)}, {position[1].toFixed(4)}
      </div>
    </div>
  );
};

export default MapPicker;
