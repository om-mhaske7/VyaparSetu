import React from "react";

const TabNavigation = ({ tab, setTab }) => {
  return (
    <div className="px-8">
      <div className="bg-white rounded-t-lg shadow">
        <div className="flex border-b">
          {["Suppliers", "Bundles", "Issues"].map((tabName) => (
            <button
              key={tabName}
              className={`px-6 py-3 font-medium transition ${
                tab === tabName
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation; 