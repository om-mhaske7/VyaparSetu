import React, { useEffect, useState } from 'react';
import { bundleAPI, uploadAPI, productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2 } from 'lucide-react'; // added icons

const Bundles = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]); // Supplier's inventory
  const [productsLoading, setProductsLoading] = useState(true);
  const [bundles, setBundles] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    // paymentMethods: array containing any of ['COD','UPI']
    paymentMethods: [], 
    items: [], // items only; total is computed from items
  });
  const [newItem, setNewItem] = useState({
    productId: '',
    price: '', // Price per item in bundle (can be different from original)
    quantity: 1,
  });
  // --- edit / delete support ---
  const [editingBundle, setEditingBundle] = useState(null);
  // editForm now holds full editable bundle detail EXCEPT final totalPrice (calculated)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    items: [], // same shape as form.items
    paymentMethods: [],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingBundleId, setDeletingBundleId] = useState(null);
  // --- end edit / delete support ---

  // Fetch supplier's inventory
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await productAPI.getMyProducts();
      setProducts(data || []);
    } catch (e) {
      console.error('Error loading products:', e);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await bundleAPI.mine();
      setBundles(data || []);
    } catch (e) {
      console.error('Error loading bundles:', e);
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'supplier') {
      loadProducts();
      load();
    }
  }, [user]);

  // Calculate total price from items
  const calculateTotalPrice = (items) => {
    return items.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      return sum + (price * qty);
    }, 0);
  };

  // --- CREATE form helpers (unchanged) ---
  const addItem = () => {
    if (!newItem.productId) {
      alert('Please select a product from your inventory');
      return;
    }

    const selectedProduct = products.find(p => p._id === newItem.productId);
    if (!selectedProduct) {
      alert('Selected product not found');
      return;
    }

    const requestedQuantity = Number(newItem.quantity || 1);
    const availableStock = Number(selectedProduct.stockQty || 0);
    
    if (requestedQuantity > availableStock) {
      alert(`Insufficient stock! Available: ${availableStock} ${selectedProduct.unit}. You requested: ${requestedQuantity}`);
      return;
    }

    if (requestedQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const bundlePrice = newItem.price ? Number(newItem.price) : selectedProduct.pricePerUnit;

    const item = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      originalPrice: selectedProduct.pricePerUnit,
      price: bundlePrice,
      quantity: requestedQuantity,
      unit: selectedProduct.unit,
      stockQty: availableStock,
    };

    setForm(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({ productId: '', price: '', quantity: 1 });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const updateItemPrice = (index, newPrice) => {
    const newItems = [...form.items];
    newItems[index].price = Number(newPrice) || 0;
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const updateItemQuantity = (index, newQuantity) => {
    const newItems = [...form.items];
    const item = newItems[index];
    const requestedQuantity = Number(newQuantity) || 1;
    
    if (requestedQuantity > item.stockQty) {
      alert(`Insufficient stock! Available: ${item.stockQty} ${item.unit}. You requested: ${requestedQuantity}`);
      return;
    }
    if (requestedQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    
    newItems[index].quantity = requestedQuantity;
    setForm(prev => ({ ...prev, items: newItems }));
  };
  // --- end CREATE helpers ---

  const submit = async () => {
    if (!form.name || form.items.length === 0) {
      alert('Please provide a bundle name and add at least one item');
      return;
    }

    const computedTotal = calculateTotalPrice(form.items);
    if (computedTotal <= 0) {
      alert('Computed total must be greater than 0');
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description || '',
        totalPrice: Number(computedTotal.toFixed(2)), // compute final total from items
        // use supplier UPI on file (do not ask again in bundle form)
        upiId: user?.upiId || '',
        paymentMethods: form.paymentMethods || [],
        ingredients: form.items.map(item => ({
          productId: item.productId,
          supplierId: user.id,
          productName: item.productName,
          supplierName: user.name || 'Supplier',
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
        collaborators: [],
      };

      await bundleAPI.create(payload);
      // reset full form shape (include paymentMethods) to avoid runtime errors
      setForm({
        name: '',
        description: '',
        paymentMethods: [],
        items: [],
      });
      await load();
      alert('Bundle created successfully!');
    } catch (e) {
      console.error('Error creating bundle:', e);
      alert('Failed: ' + (e.message || 'error'));
    }
  };

  // --- EDIT helpers: allow editing all bundle details except final totalPrice (computed) ---
  const openEdit = (bundle) => {
    if (!bundle || !bundle._id) {
      alert('Invalid bundle data');
      return;
    }
    
    console.log('Opening edit for bundle:', bundle._id, bundle);
    
    // Ensure inventory loaded so we can validate stock & show product names
    if (!products || products.length === 0) loadProducts();

    // Map server ingredients -> local editable items
    const items = (bundle.ingredients || []).map(ing => {
      const prod = products.find(p => p._id === (ing.productId || ing.productId));
      return {
        productId: ing.productId || ing.productId,
        productName: ing.productName || prod?.name || ing.productName || '',
        originalPrice: prod ? prod.pricePerUnit : (ing.price || 0),
        price: Number(ing.price) || 0,
        quantity: Number(ing.quantity) || 1,
        unit: prod?.unit || ing.unit || '',
        stockQty: prod ? Number(prod.stockQty || 0) : 0,
      };
    });

    setEditingBundle(bundle);
    setEditForm({
      name: bundle.name || '',
      description: bundle.description || '',
      items: items,
      paymentMethods: bundle.paymentMethods || [],
    });
    setShowEditModal(true);
  };

  const addEditItem = () => {
    if (!newItem.productId) {
      alert('Please select a product to add');
      return;
    }
    const selectedProduct = products.find(p => p._id === newItem.productId);
    if (!selectedProduct) {
      alert('Product not found');
      return;
    }

    // prevent duplicates
    if (editForm.items.some(it => it.productId === newItem.productId)) {
      alert('Product already in bundle');
      return;
    }

    const requestedQuantity = Number(newItem.quantity || 1);
    const availableStock = Number(selectedProduct.stockQty || 0);
    if (requestedQuantity > availableStock) {
      alert(`Insufficient stock! Available: ${availableStock} ${selectedProduct.unit}.`);
      return;
    }

    const item = {
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      originalPrice: selectedProduct.pricePerUnit,
      price: newItem.price ? Number(newItem.price) : selectedProduct.pricePerUnit,
      quantity: requestedQuantity,
      unit: selectedProduct.unit,
      stockQty: availableStock,
    };

    setEditForm(prev => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ productId: '', price: '', quantity: 1 });
  };

  const removeEditItem = (index) => {
    const newItems = editForm.items.filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, items: newItems }));
  };

  const updateEditItemPrice = (index, newPrice) => {
    const newItems = [...editForm.items];
    newItems[index].price = Number(newPrice) || 0;
    setEditForm(prev => ({ ...prev, items: newItems }));
  };

  const updateEditItemQuantity = (index, newQuantity) => {
    const newItems = [...editForm.items];
    const item = newItems[index];
    const requestedQuantity = Number(newQuantity) || 1;

    if (requestedQuantity > item.stockQty) {
      alert(`Insufficient stock! Available: ${item.stockQty} ${item.unit}.`);
      return;
    }
    if (requestedQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    newItems[index].quantity = requestedQuantity;
    setEditForm(prev => ({ ...prev, items: newItems }));
  };

  const submitEdit = async () => {
    if (!editingBundle || !editingBundle._id) {
      alert('Invalid bundle selected for editing');
      return;
    }
    if (!editForm.name || editForm.items.length === 0) {
      alert('Please provide a name and add at least one item to the bundle');
      return;
    }
    setActionLoading(true);
    try {
      const computedTotal = calculateTotalPrice(editForm.items);
      if (computedTotal <= 0) {
        alert('Total price must be greater than 0');
        setActionLoading(false);
        return;
      }
      
      const payload = {
        name: editForm.name,
        description: editForm.description || '',
        totalPrice: Number(computedTotal.toFixed(2)),
        upiId: user?.upiId || '',
        paymentMethods: editForm.paymentMethods || [],
        ingredients: editForm.items.map(item => ({
          productId: item.productId,
          supplierId: user.id,
          productName: item.productName,
          supplierName: user.name || 'Supplier',
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
      };
      
      if (!editingBundle._id) {
        throw new Error('Bundle ID is missing');
      }
      console.log('Updating bundle ID:', editingBundle._id, 'Payload:', payload);
      const bundleId = String(editingBundle._id).trim();
      if (!bundleId) {
        throw new Error('Invalid bundle ID');
      }
      await bundleAPI.update(bundleId, payload);
      await load();
      setShowEditModal(false);
      setEditingBundle(null);
      alert('Bundle updated successfully!');
    } catch (e) {
      console.error('Edit failed', e);
      const errorMessage = e.message || 'Unknown error occurred';
      alert('Update failed: ' + errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBundle = async (id) => {
    if (!id) {
      alert('Invalid bundle ID');
      return;
    }
    const ok = window.confirm('Delete this bundle? This action cannot be undone.');
    if (!ok) return;
    setDeletingBundleId(id);
    try {
      console.log('Deleting bundle:', id);
      await bundleAPI.delete(id);
      await load();
      alert('Bundle deleted successfully!');
    } catch (e) {
      console.error('Delete failed', e);
      const errorMessage = e.message || 'Unknown error';
      alert('Delete failed: ' + errorMessage);
    } finally {
      setDeletingBundleId(null);
    }
  };

  if (!user || user.role !== 'supplier') return null;

  return (
    <div className="px-8 py-4 space-y-6">
      <h3 className="text-xl font-semibold">Create Bundle</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Bundle Form */}
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-semibold mb-4 text-lg">Create New Bundle</h4>
          <div className="space-y-4">
            {/* Bundle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundle Name *
              </label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Essential Care Bundle"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your bundle..."
                rows="3"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Final Total - computed from items (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Price (₹)
                <span className="text-xs text-gray-500 ml-2">Auto-calculated from items</span>
              </label>
              <div className="w-full border rounded px-3 py-2 bg-gray-50 text-right font-semibold">
                ₹{calculateTotalPrice(form.items).toFixed(2)}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Options
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.paymentMethods.includes('COD')}
                    onChange={(e) => {
                      setForm(prev => {
                        const next = new Set(prev.paymentMethods || []);
                        if (e.target.checked) next.add('COD'); else next.delete('COD');
                        return { ...prev, paymentMethods: Array.from(next) };
                      });
                    }}
                  />
                  Cash on Delivery
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.paymentMethods.includes('UPI')}
                    onChange={(e) => {
                      setForm(prev => {
                        const next = new Set(prev.paymentMethods || []);
                        if (e.target.checked) next.add('UPI'); else next.delete('UPI');
                        return { ...prev, paymentMethods: Array.from(next) };
                      });
                    }}
                  />
                  UPI
              </label>
            </div>
              <div className="text-xs text-gray-500 mb-2">
                Select which payment methods you accept for this bundle.
              </div>
              {/* optional UPI ID if UPI enabled */}
              {form.paymentMethods.includes('UPI') && (
                <input
                  className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="UPI ID (optional, shown to buyer)"
                  value={form.upiId}
                  onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))}
                />
              )}
            </div>

            {/* Items Section */}
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Items *
              </label>

              {/* Add Item Form */}
              <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Select Product from Inventory
                  </label>
                  {productsLoading ? (
                    <div className="text-sm text-gray-500">Loading products...</div>
                  ) : products.length === 0 ? (
                    <div className="text-sm text-red-500">
                      No products in inventory. Add products first.
                    </div>
                  ) : (() => {
                    // Filter out products already in the bundle
                    const addedProductIds = form.items.map(item => item.productId);
                    const availableProducts = products.filter(
                      product => !addedProductIds.includes(product._id)
                    );
                    
                    return availableProducts.length === 0 ? (
                      <div className="text-sm text-orange-500">
                        All available products have been added to this bundle.
              </div>
                    ) : (
                      <select
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newItem.productId}
                        onChange={e => {
                          const product = products.find(p => p._id === e.target.value);
                          setNewItem({
                            productId: e.target.value,
                            price: product ? product.pricePerUnit.toString() : '',
                            quantity: 1,
                          });
                        }}
                      >
                        <option value="">-- Select Product --</option>
                        {availableProducts.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ₹{product.pricePerUnit}/{product.unit} (Stock: {product.stockQty})
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                {newItem.productId && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Bundle Price per Item (₹)
                          <span className="text-xs text-gray-400 ml-1">(Original: ₹{products.find(p => p._id === newItem.productId)?.pricePerUnit || 0})</span>
                        </label>
                        <input
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          type="number"
                          step="0.01"
                          placeholder="Enter bundle price"
                          value={newItem.price}
                          onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Quantity
                          <span className="text-xs text-gray-400 ml-1">
                            (Max: {products.find(p => p._id === newItem.productId)?.stockQty || 0})
                          </span>
                        </label>
                        <input
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          type="number"
                          min="1"
                          max={products.find(p => p._id === newItem.productId)?.stockQty || 0}
                          placeholder="1"
                          value={newItem.quantity}
                          onChange={e => {
                            const maxStock = products.find(p => p._id === newItem.productId)?.stockQty || 0;
                            const val = Number(e.target.value) || 1;
                            const clampedVal = val > maxStock ? maxStock : val;
                            setNewItem(p => ({ ...p, quantity: clampedVal }));
                          }}
                        />
                        {newItem.productId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Available stock: {products.find(p => p._id === newItem.productId)?.stockQty || 0} {products.find(p => p._id === newItem.productId)?.unit || ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
                      onClick={addItem}
                    >
                      Add to Bundle
                    </button>
                  </>
                )}
              </div>

              {/* Items List */}
              {form.items.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Items in Bundle ({form.items.length}):
                  </div>
                  <ul className="space-y-2">
                    {form.items.map((item, idx) => {
                      const product = products.find(p => p._id === item.productId);
                      return (
                        <li
                          key={idx}
                          className="flex items-start justify-between p-3 bg-white border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                  Bundle Price:
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="ml-1 w-28 border rounded px-2 py-1 text-xs"
                                    value={item.price}
                                    onChange={e => updateItemPrice(idx, e.target.value)}
                                  />
                                  {item.originalPrice !== item.price && (
                                    <div className="text-gray-400 text-xs mt-1">
                                      (Original: ₹{item.originalPrice})
                                    </div>
              )}
            </div>

                                <div>
                                  Quantity:
                                  <input
                                    type="number"
                                    min="1"
                                    max={item.stockQty}
                                    className="ml-1 w-20 border rounded px-2 py-1 text-xs"
                                    value={item.quantity}
                                    onChange={e => {
                                      const maxStock = item.stockQty;
                                      const val = Number(e.target.value) || 1;
                                      const clampedVal = val > maxStock ? maxStock : val;
                                      updateItemQuantity(idx, clampedVal);
                                    }}
                                  />
                                  <div className="text-xs text-gray-400 mt-1">
                                    / {item.stockQty} available
                                  </div>
                                </div>
                              </div>

                              <div className="text-purple-600 font-medium mt-2">
                                Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
              </div>
                          <button
                            onClick={() => removeItem(idx)}
                            className="ml-2 text-red-500 hover:text-red-700 text-lg"
                            title="Remove item"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                </ul>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={submit}
                disabled={!form.name || form.items.length === 0}
              >
                Create Bundle
              </button>
            </div>
          </div>
        </div>

        {/* My Bundles List */}
        <div className="border rounded-lg p-4 bg-white">
          <h4 className="font-semibold mb-4 text-lg">My Bundles</h4>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : bundles.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No bundles created yet
              <div className="text-sm mt-2">Create your first bundle to get started!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {bundles.map(bundle => (
                <div key={bundle._id} className="border rounded p-4 hover:shadow-md transition-shadow relative">
                  {/* Edit / Delete icon buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      className="p-1 rounded hover:bg-gray-100 text-gray-700"
                      onClick={() => openEdit(bundle)}
                      title="Edit bundle"
                      aria-label="Edit bundle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100 text-red-600"
                      onClick={() => deleteBundle(bundle._id)}
                      disabled={deletingBundleId === bundle._id}
                      title="Delete bundle"
                      aria-label="Delete bundle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{bundle.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{bundle.description}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">₹{bundle.totalPrice}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          bundle.status === 'active' ? 'bg-green-100 text-green-700' :
                          bundle.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          bundle.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bundle.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Items: {bundle.ingredients?.length || 0} product{bundle.ingredients?.length !== 1 ? 's' : ''}
                    </div>
                    {bundle.ingredients && bundle.ingredients.length > 0 && (
                      <div className="mt-2 text-xs">
                        <div className="font-medium mb-1">Contents:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                          {bundle.ingredients.map((ing, idx) => (
                            <li key={idx}>
                              {ing.productName || ing.productId} - {ing.quantity}x @ ₹{ing.price} each
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t text-xs">
                      Orders: {bundle.totalOrders || 0} • Created: {new Date(bundle.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Bundle Modal */}
      {showEditModal && editingBundle && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => { if (!actionLoading) { setShowEditModal(false); setEditingBundle(null); } }}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Edit Bundle</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input className="w-full border rounded px-3 py-2" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Items editor */}
              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Items *</label>

                {/* Add item to edit form */}
                <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded">
                  <div>
                    {productsLoading ? (
                      <div className="text-sm text-gray-500">Loading products...</div>
                    ) : products.length === 0 ? (
                      <div className="text-sm text-red-500">No products in inventory.</div>
                    ) : (() => {
                      const addedIds = editForm.items.map(i => i.productId);
                      const availableProducts = products.filter(p => !addedIds.includes(p._id));
                      return availableProducts.length === 0 ? (
                        <div className="text-sm text-orange-500">All available products already in bundle.</div>
                      ) : (
                        <select
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={newItem.productId}
                          onChange={e => {
                            const product = products.find(p => p._id === e.target.value);
                            setNewItem({
                              productId: e.target.value,
                              price: product ? product.pricePerUnit.toString() : '',
                              quantity: 1,
                            });
                          }}
                        >
                          <option value="">-- Select Product --</option>
                          {availableProducts.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ₹{product.pricePerUnit}/{product.unit} (Stock: {product.stockQty})
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>

                  {newItem.productId && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Bundle Price per Item (₹)
                        </label>
                        <input
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          type="number"
                          step="0.01"
                          placeholder="Enter bundle price"
                          value={newItem.price}
                          onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Quantity
                        </label>
                        <input
                          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          type="number"
                          min="1"
                          placeholder="1"
                          value={newItem.quantity}
                          onChange={e => {
                            const val = Number(e.target.value) || 1;
                            setNewItem(p => ({ ...p, quantity: val }));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {newItem.productId && (
                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-2 bg-purple-600 text-white rounded" onClick={addEditItem}>Add to Bundle</button>
                      <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setNewItem({ productId: '', price: '', quantity: 1 })}>Cancel</button>
                    </div>
                  )}
                </div>

                {/* Editable items list */}
                {editForm.items.length > 0 ? (
                  <ul className="space-y-2">
                    {editForm.items.map((item, idx) => (
                      <li key={idx} className="flex items-start justify-between p-3 bg-white border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            <div className="grid grid-cols-2 gap-4 items-center">
                              <div>
                                Quantity:
                                <input
                                  type="number"
                                  min="1"
                                  className="ml-1 w-20 border rounded px-2 py-1 text-xs"
                                  value={item.quantity}
                                  onChange={e => updateEditItemQuantity(idx, e.target.value)}
                                />
                                <span className="text-xs text-gray-400 ml-1">/ {item.stockQty || 0} available</span>
                              </div>
                              <div>
                                Price:
                                <input
                                  type="number"
                                  step="0.01"
                                  className="ml-1 w-28 border rounded px-2 py-1 text-xs"
                                  value={item.price}
                                  onChange={e => updateEditItemPrice(idx, e.target.value)}
                                />
                              </div>
                              <div className="text-purple-600 font-medium">
                                Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeEditItem(idx)} className="ml-2 text-red-500 hover:text-red-700 text-lg" title="Remove item">×</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No items in this bundle yet.</div>
                )}
              </div>

              {/* Display computed total (readonly) */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Final Total (computed)</div>
                  <div className="text-lg font-bold text-green-600">₹{calculateTotalPrice(editForm.items).toFixed(2)}</div>
                </div>
              </div>

              {/* Payment / QR (editable) */}
              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.paymentMethods?.includes('COD')}
                      onChange={(e) => {
                        setEditForm(prev => {
                          const next = new Set(prev.paymentMethods || []);
                          if (e.target.checked) next.add('COD'); else next.delete('COD');
                          return { ...prev, paymentMethods: Array.from(next) };
                        });
                      }}
                    />
                    Cash on Delivery
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.paymentMethods?.includes('UPI')}
                      onChange={(e) => {
                        setEditForm(prev => {
                          const next = new Set(prev.paymentMethods || []);
                          if (e.target.checked) next.add('UPI'); else next.delete('UPI');
                          return { ...prev, paymentMethods: Array.from(next) };
                        });
                      }}
                    />
                    UPI
                  </label>
                </div>
                {editForm.paymentMethods?.includes('UPI') && (
                  <input
                    className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="UPI ID (optional)"
                    value={editForm.upiId || ''}
                    onChange={e => setEditForm(f => ({ ...f, upiId: e.target.value }))}
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => { if (!actionLoading) { setShowEditModal(false); setEditingBundle(null); } }} disabled={actionLoading}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submitEdit} disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bundles;
