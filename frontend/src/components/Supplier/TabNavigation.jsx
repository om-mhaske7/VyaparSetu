import React from "react";

const TabNavigation = ({ tab, setTab, showAddForm, setShowAddForm }) => {
  return (
    <>
      {/* Tabs */}
      <div className="flex justify-center gap-6 px-8">
        {["Products", "Orders", "Dispatch"].map((t) => (
          <button
            key={t}
            className={`px-8 py-2 rounded-t-lg font-medium transition-colors duration-200 ${tab === t ? "bg-white text-green-600 shadow" : "bg-transparent text-gray-500"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Add Product Button - Outside catalog for Products tab only */}
      {tab === "Products" && (
        <div className="flex justify-end px-8 mt-4 mb-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition mr-10"
            onClick={() => setShowAddForm(true)}
          >
            + Add Product
          </button>
        </div>
      )}
    </>
  );
};

export default TabNavigation; 