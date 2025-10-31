import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bundleAPI } from '../services/api';

const BundleDetail = () => {
  const { id } = useParams();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await bundleAPI.getById(id);
        setBundle(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!bundle) return <div className="p-6">Bundle not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{bundle.name}</h2>
          <div className="text-gray-600">₹{bundle.totalPrice}</div>
          <div className="text-sm text-gray-500">Orders: {bundle.totalOrders || 0} • Rating: {bundle.avgRating?.toFixed?.(1) || 'N/A'}</div>
        </div>
        {bundle.upiId && (
          <div className="text-right text-sm">
            <div className="font-medium">Pay to UPI</div>
            <div>{bundle.upiId}</div>
          </div>
        )}
      </div>
      <p className="text-gray-700">{bundle.description}</p>
      <div>
        <div className="font-semibold mb-1">Ingredients</div>
        <ul className="list-disc pl-6 text-sm text-gray-800">
          {bundle.ingredients?.map((ing, idx) => (
            <li key={idx}>{ing.productId?.name || ing.productId} from {ing.supplierId?.name || ing.supplierId}</li>
          ))}
        </ul>
      </div>
      {bundle.upiQrCode && (
        <div>
          <div className="font-semibold mb-1">UPI QR</div>
          <img src={bundle.upiQrCode} alt="UPI QR" className="w-40 h-40 object-contain border rounded bg-white" />
        </div>
      )}
    </div>
  );
};

export default BundleDetail;


