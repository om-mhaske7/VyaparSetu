import React, { useState } from "react";

const AddProductForm = ({
  showAddForm,
  setShowAddForm,
  form,
  handleFormChange,
  handleAddProduct, // Add this prop
  adding,
  showToast,
  handleOkToast,
  setShowToast // Ensure this is passed from the parent
}) => {
  const [imageProcessing, setImageProcessing] = useState(false);
  
  if (!showAddForm) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setShowToast({ type: "error", message: "Please select a valid image file" });
        return;
      }
      
      // Validate file size (max 2MB for raw file)
      if (file.size > 2 * 1024 * 1024) {
        setShowToast({ type: "error", message: "Image size should be less than 2MB" });
        return;
      }

      setImageProcessing(true);

      // Create image element to resize
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 800x600)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions and draw resized image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        
        // Check if compressed image is still too large (max 500KB base64)
        if (compressedBase64.length > 500 * 1024) {
          setShowToast({ type: "error", message: "Image is still too large after compression. Please choose a smaller image." });
          setImageProcessing(false);
          return;
        }
        
        handleFormChange({
          target: {
            name: 'image',
            value: compressedBase64
          }
        });
        setImageProcessing(false);
      };
      
      img.onerror = () => {
        setShowToast({ type: "error", message: "Failed to load image. Please try another file." });
        setImageProcessing(false);
      };
      
      // Load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-end mt-2 mb-6">
      <div className="w-full relative bg-white rounded-lg shadow p-6">
        {/* Cross button */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl font-bold focus:outline-none"
          onClick={() => setShowAddForm(false)}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Add Product</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddProduct}>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="e.g. Premium Basmati Rice"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageProcessing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                key={form.image ? 'with-image' : 'no-image'} // This will reset the input when form.image changes
              />
              {imageProcessing && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  Processing...
                </div>
              )}
              {form.image && !imageProcessing && (
                <div className="flex-shrink-0">
                  <img
                    src={form.image}
                    alt="Product preview"
                    className="h-16 w-16 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload an image of your product (max 2MB, PNG/JPG/JPEG). Image will be automatically resized and compressed.
            </p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="e.g. High quality organic rice"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleFormChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="liter">Liter</option>
              <option value="packet">Packet</option>
              <option value="piece">Piece</option>
              <option value="box">Box</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹)</label>
            <input
              type="number"
              name="pricePerUnit"
              value={form.pricePerUnit}
              onChange={handleFormChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="e.g. 45.5"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stockQty"
              value={form.stockQty}
              onChange={handleFormChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="e.g. 100"
              min="0"
              required
            />
          </div>
          <input type="hidden" name="supplierId" value={form.supplierId} />
          <div className="col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-60"
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
        {showToast && showToast.type === "success" && (
          <div className="mt-4 px-4 py-2 rounded text-white font-medium bg-green-500 flex items-center justify-between">
            <span>{showToast.message}</span>
            <button
              className="ml-4 bg-white text-green-700 px-3 py-1 rounded font-semibold border border-green-600 hover:bg-green-50 transition"
              onClick={handleOkToast}
            >
              OK
            </button>
          </div>
        )}
        {showToast && showToast.type === "error" && (
          <div className="mt-4 px-4 py-2 rounded text-white font-medium bg-red-500">
            {showToast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProductForm;
