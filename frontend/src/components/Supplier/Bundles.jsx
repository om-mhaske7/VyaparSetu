import React, { useEffect, useState } from 'react';
import { bundleAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Bundles = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', totalPrice: '', upiId: '', upiQrCode: '', ingredients: [], collaborators: [] });
  const [newIngredient, setNewIngredient] = useState({ productName: '', supplierName: '', price: '', quantity: 1 });
  const [newCollaborator, setNewCollaborator] = useState('');
  const [qrPreview, setQrPreview] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await bundleAPI.mine();
      setBundles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addIngredient = () => {
    if (!newIngredient.productName || !newIngredient.supplierName) return;
    const ing = { ...newIngredient, price: Number(newIngredient.price || 0), quantity: Number(newIngredient.quantity || 1) };
    setForm(prev => ({ ...prev, ingredients: [...prev.ingredients, ing] }));
    setNewIngredient({ productName: '', supplierName: '', price: '', quantity: 1 });
  };
  const addCollaborator = () => {
    if (!newCollaborator) return;
    setForm(prev => ({ ...prev, collaborators: [...prev.collaborators, newCollaborator] }));
    setNewCollaborator('');
  };
  const submit = async () => {
    try {
      const payload = { ...form, totalPrice: Number(form.totalPrice) };
      await bundleAPI.create(payload);
      setForm({ name: '', description: '', totalPrice: '', upiId: '', upiQrCode: '', ingredients: [], collaborators: [] });
      await load();
      alert('Bundle created');
    } catch (e) {
      alert('Failed: ' + (e.message || 'error'));
    }
  };

  if (!user || user.role !== 'supplier') return null;

  return (
    <div className="px-8 py-4 space-y-6">
      <h3 className="text-xl font-semibold">Bundles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-semibold mb-2">Create Bundle</h4>
          <div className="space-y-3">
            <input className="w-full border rounded px-3 py-2" placeholder="Bundle name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" placeholder="Total price" type="number" value={form.totalPrice} onChange={e => setForm(p => ({ ...p, totalPrice: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" placeholder="UPI ID" value={form.upiId} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))} />
            <div className="flex items-center gap-3">
              {form.upiQrCode ? (
                <button type="button" onClick={() => setQrPreview(form.upiQrCode)} className="focus:outline-none">
                  <img src={form.upiQrCode} alt="QR" className="w-20 h-20 object-contain border rounded" />
                </button>
              ) : (
                <div className="w-20 h-20 border rounded flex items-center justify-center text-xs text-gray-500">No QR</div>
              )}
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                Upload UPI QR
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (!f.type.startsWith('image/')) { alert('Upload an image'); return; }
                  try {
                    const res = await uploadAPI.uploadImage(f);
                    setForm(p => ({ ...p, upiQrCode: res.path }));
                  } catch (err) {
                    alert('Upload failed');
                  }
                }} />
              </label>
            </div>
            <div className="border-t pt-3">
              <div className="font-medium mb-2">Ingredients</div>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Product name" value={newIngredient.productName} onChange={e => setNewIngredient(p => ({ ...p, productName: e.target.value }))} />
                <input className="flex-1 border rounded px-3 py-2" placeholder="Supplier shop name" value={newIngredient.supplierName} onChange={e => setNewIngredient(p => ({ ...p, supplierName: e.target.value }))} />
                <input className="w-28 border rounded px-3 py-2" type="number" placeholder="Cost" value={newIngredient.price} onChange={e => setNewIngredient(p => ({ ...p, price: e.target.value }))} />
                <input className="w-20 border rounded px-3 py-2" type="number" placeholder="Qty" value={newIngredient.quantity} onChange={e => setNewIngredient(p => ({ ...p, quantity: Number(e.target.value) }))} />
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={addIngredient}>Add</button>
              </div>
              {form.ingredients.length > 0 && (
                <ul className="text-sm text-gray-700 list-disc pl-5">
                  {form.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing.productName} from {ing.supplierName} • ₹{ing.price} x {ing.quantity}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t pt-3">
              <div className="font-medium mb-2">Collaborators</div>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Supplier ID" value={newCollaborator} onChange={e => setNewCollaborator(e.target.value)} />
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={addCollaborator}>Add</button>
              </div>
              {form.collaborators.length > 0 && (
                <ul className="text-sm text-gray-700 list-disc pl-5">
                  {form.collaborators.map((id, idx) => (<li key={idx}>{id}</li>))}
                </ul>
              )}
            </div>
            <div className="pt-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={submit}>Create Bundle</button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-semibold mb-2">My Bundles</h4>
          {loading ? (
            <div>Loading...</div>
          ) : bundles.length === 0 ? (
            <div className="text-gray-500">No bundles yet</div>
          ) : (
            <div className="space-y-3">
              {bundles.map(b => (
                <div key={b._id} className="border rounded p-3">
                  <div className="font-medium">{b.name} <span className="text-xs px-2 py-0.5 rounded bg-gray-100 ml-2">{b.status}</span></div>
                  <div className="text-sm text-gray-600">Price: ₹{b.totalPrice}</div>
                  <div className="text-xs text-gray-500">Ingredients: {b.ingredients?.length || 0} • Collaborators: {b.collaborators?.length || 0} • Orders: {b.totalOrders || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {qrPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setQrPreview('')}>
          <div className="bg-white rounded-lg p-2 max-w-full" onClick={(e) => e.stopPropagation()}>
            <img src={qrPreview} alt="UPI QR Preview" className="max-h-[80vh] max-w-[90vw] object-contain" />
            <div className="text-center mt-2">
              <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={() => setQrPreview('')}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bundles;


