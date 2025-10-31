import React, { useEffect, useState } from 'react';
import { bundleAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const BundlesList = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await bundleAPI.publicList();
        setBundles(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Bundles</h2>
      {loading ? (
        <div>Loading...</div>
      ) : bundles.length === 0 ? (
        <div className="text-gray-500">No bundles found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bundles.map(b => (
            <div key={b._id} className="border rounded-lg p-4 bg-white cursor-pointer hover:shadow" onClick={() => navigate(`/bundles/${b._id}`)}>
              <div className="font-semibold">{b.name}</div>
              <div className="text-sm text-gray-600">Price: ₹{b.totalPrice}</div>
              <div className="text-xs text-gray-500 mt-1">Orders: {b.totalOrders || 0} • Rating: {b.avgRating?.toFixed?.(1) || 'N/A'}</div>
              {Array.isArray(b.collaborators) && b.collaborators.length > 1 && (
                <div className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700">Collaborative Bundle</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BundlesList;


