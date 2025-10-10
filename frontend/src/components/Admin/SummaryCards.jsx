import React, { useEffect, useState } from "react";
import { getPendingVerificationCount, getRejectedVerificationCount } from "../../services/adminServices";

import {
  FaUsers,
  FaExclamationTriangle,
  FaRupeeSign,
  FaShieldAlt,
} from "react-icons/fa";


const SummaryCards = ({ issues = [] }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    // Fetch counts on mount
    const fetchCounts = async () => {
      try {
        const [pending, rejected] = await Promise.all([
          getPendingVerificationCount(),
          getRejectedVerificationCount(),
        ]);
        setPendingCount(pending);
        setRejectedCount(rejected);
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    };

    fetchCounts();
  }, []);

  const summaryData = [
    {
      label: "Pending Suppliers",
      value: pendingCount,
      icon: <FaUsers className="text-yellow-500 text-xl" />,
    },
    {
      label: "Rejected Verifications",
      value: rejectedCount,
      icon: <FaShieldAlt className="text-red-500 text-xl" />,
    },
    {
      label: "Open Issues",
      value: issues?.filter((i) => i.status === "pending")?.length || 0,
      icon: <FaExclamationTriangle className="text-red-500 text-xl" />,
    },
    {
      label: "Total Revenue",
      value: "₹2,45,670", // static or replace with dynamic later
      icon: <FaRupeeSign className="text-green-600 text-xl" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-8 py-6">
      {summaryData.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
        >
          <div>{item.icon}</div>
          <div>
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className="text-xl font-bold text-gray-800">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;