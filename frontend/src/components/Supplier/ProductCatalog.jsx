import React from "react";

const ProductCatalog = ({
  products,
  loading,
  editIndex,
  editProduct,
  handleEditClick,
  handleEditChange,
  handleEditSave,
  handleEditCancel
}) => {
  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Catalog</h2>
        </div>
        <div className="flex justify-center items-center py-10">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Catalog</h2>
        </div>
        <div className="flex justify-center items-center py-10">
          <div className="text-gray-500">No products found. Add your first product to get started!</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Catalog</h2>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[600px] w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 px-1 sm:px-2">Image</th>
              <th className="py-2 px-1 sm:px-2">Product</th>
              <th className="px-1 sm:px-2">Category</th>
              <th className="px-1 sm:px-2">Price</th>
              <th className="px-1 sm:px-2">Stock</th>
              <th className="px-1 sm:px-2">Status</th>
              <th className="px-1 sm:px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr key={p._id || p.name || idx} className="border-b last:border-b-0">
                <td className="py-2 px-1 sm:px-2">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-lg border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-1 sm:px-2">
                  <div className="font-semibold text-gray-800 text-xs sm:text-sm">{p.name}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{p.desc}</div>
                </td>
                <td className="px-1 sm:px-2">
                  {editIndex === idx ? (
                    <input
                      className="border rounded px-1 sm:px-2 py-1 w-full text-xs sm:text-sm"
                      name="category"
                      value={editProduct.category}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <span className="text-xs sm:text-sm">{p.category}</span>
                  )}
                </td>
                <td className="px-1 sm:px-2">
                  {editIndex === idx ? (
                    <input
                      className="border rounded px-1 sm:px-2 py-1 w-full text-xs sm:text-sm"
                      name="price"
                      value={editProduct.price}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <span className="text-xs sm:text-sm">{p.price}</span>
                  )}
                </td>
                <td className="px-1 sm:px-2">
                  {editIndex === idx ? (
                    <input
                      className="border rounded px-1 sm:px-2 py-1 w-full text-xs sm:text-sm"
                      name="stock"
                      type="number"
                      value={editProduct.stock}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <span className="text-xs sm:text-sm">{p.stock}</span>
                  )}
                </td>
                <td className="px-1 sm:px-2">
                  {editIndex === idx ? (
                    <select
                      className="border rounded px-1 sm:px-2 py-1 w-full text-xs sm:text-sm"
                      name="status"
                      value={editProduct.status}
                      onChange={handleEditChange}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${
                        p.status.trim() === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status.trim() === "available" ? "Available" : "Unavailable"}
                    </span>
                  )}
                </td>
                <td className="px-1 sm:px-2">
                  {editIndex === idx ? (
                    <>
                      <button className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded mr-1 sm:mr-2 text-xs sm:text-sm" onClick={handleEditSave}>Save</button>
                      <button className="bg-gray-300 text-gray-800 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm" onClick={handleEditCancel}>Cancel</button>
                    </>
                  ) : (
                    <button className="border px-2 sm:px-3 py-1 rounded hover:bg-gray-100 transition text-xs sm:text-sm" onClick={() => handleEditClick(idx)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductCatalog; 