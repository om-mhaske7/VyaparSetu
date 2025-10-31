import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Component to update map view when suppliers change
const MapBounds = ({ suppliers }) => {
  const map = useMap();

  useEffect(() => {
    if (suppliers.length > 0) {
      const validSuppliers = suppliers.filter(
        (s) =>
          s.latitude != null &&
          s.longitude != null &&
          !isNaN(Number(s.latitude)) &&
          !isNaN(Number(s.longitude))
      );
      if (validSuppliers.length > 0) {
        const bounds = L.latLngBounds(
          validSuppliers.map((s) => [Number(s.latitude), Number(s.longitude)])
        );
        // add extra horizontal padding on the left since panel moves to left
        map.fitBounds(bounds, { padding: [400, 50] });
      }
    }
  }, [suppliers, map]);

  return null;
};

const SupplierSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersWithLocation, setSuppliersWithLocation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Use the same API base URL format as the rest of the codebase
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleSearch = async (searchValue) => {
    const q = String(searchValue || "").trim();
    if (!q) {
      setSuppliers([]);
      setSuppliersWithLocation([]);
      setError(null);
      setSelectedSupplier(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const url = `${API_BASE}/users/suppliers/search?name=${encodeURIComponent(q)}`;

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers,
        mode: "cors",
      });

      if (res.status === 401) {
        throw new Error("Unauthorized — please log in to search suppliers.");
      }

      if (!res.ok) {
        const txt = await res.text();
        let errorMessage = `Server error (${res.status})`;
        try {
          const errorData = JSON.parse(txt);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = txt ? txt.slice(0, 300) : res.statusText;
        }
        throw new Error(errorMessage);
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(`Expected JSON but received: ${txt.slice(0, 300)}`);
      }

      const data = await res.json();

      let allSuppliers = [];
      let withLocation = [];

      if (data.success && Array.isArray(data.suppliers)) {
        allSuppliers = data.suppliers;
        withLocation =
          data.suppliersWithLocation ||
          allSuppliers.filter(
            (s) =>
              s.latitude != null &&
              s.longitude != null &&
              !isNaN(Number(s.latitude)) &&
              !isNaN(Number(s.longitude))
          );
      } else if (Array.isArray(data)) {
        allSuppliers = data;
        withLocation = allSuppliers.filter(
          (s) =>
            s.latitude != null &&
            s.longitude != null &&
            !isNaN(Number(s.latitude)) &&
            !isNaN(Number(s.longitude))
        );
      } else if (Array.isArray(data.suppliers)) {
        allSuppliers = data.suppliers;
        withLocation = allSuppliers.filter(
          (s) =>
            s.latitude != null &&
            s.longitude != null &&
            !isNaN(Number(s.latitude)) &&
            !isNaN(Number(s.longitude))
        );
      }

      withLocation = withLocation.map((s) => ({
        ...s,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
      }));

      if (allSuppliers.length === 0) {
        setError("No suppliers found with that name.");
      } else {
        setError(null);
      }

      setSuppliers(allSuppliers);
      setSuppliersWithLocation(withLocation);
      setSelectedSupplier(null);
    } catch (err) {
      console.error("Error searching suppliers:", err);
      setError(err.message || "An error occurred while searching.");
      setSuppliers([]);
      setSuppliersWithLocation([]);
      setSelectedSupplier(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    handleSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSuppliers([]);
    setSuppliersWithLocation([]);
    setError(null);
    setSelectedSupplier(null);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full Screen Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100vh", width: "100%", zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds suppliers={suppliersWithLocation} />
        {suppliersWithLocation.map((supplier) =>
          supplier.latitude && supplier.longitude ? (
            <Marker
              key={supplier._id}
              position={[supplier.latitude, supplier.longitude]}
              eventHandlers={{
                click: () => {
                  setSelectedSupplier(supplier);
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-1">{supplier.name}</h3>
                  {supplier.address && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Address:</strong> {supplier.address}
                    </p>
                  )}
                  {supplier.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Phone:</strong> {supplier.phone}
                    </p>
                  )}
                  {supplier.email && (
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {supplier.email}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>

      {/* Search Bar - Top Left Corner */}
      <div className="absolute top-4 left-4 z-[1000] w-96">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-white rounded-full shadow-2xl border border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search suppliers..."
              className="w-full px-4 py-3 pl-12 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {loading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            {searchTerm && !loading && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-2 bg-red-50 border-l-4 border-red-400 rounded p-3 shadow-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Panel - Left Side */}
      {suppliers.length > 0 && (
        <div
          className="absolute top-20 left-4 z-[1000] w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          style={{
            maxHeight: "calc(100vh - 96px)", // Leave space for search bar + padding
            height: "fit-content",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center">
              <h2 className="text-base font-semibold text-gray-800">
                Results
              </h2>
              <span className="ml-2 text-sm text-gray-500">
                ({suppliers.length})
              </span>
            </div>
            <button
              onClick={() => {
                setSuppliers([]);
                setSuppliersWithLocation([]);
                setSelectedSupplier(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Results List */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 160px)" }}
          >
            <div className="divide-y divide-gray-200">
              {suppliers.map((supplier) => {
                const hasLocation =
                  supplier.latitude != null &&
                  supplier.longitude != null &&
                  !isNaN(Number(supplier.latitude)) &&
                  !isNaN(Number(supplier.longitude));
                const isSelected = selectedSupplier?._id === supplier._id;

                return (
                  <div
                    key={supplier._id}
                    onClick={() => setSelectedSupplier(supplier)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {supplier.name}
                      </h3>
                      {hasLocation && (
                        <span className="ml-2 flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>

                    {supplier.address && (
                      <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                        {supplier.address}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {supplier.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {!hasLocation && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          No location
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSearch;
