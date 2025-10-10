import React from "react";
import { FaEye, FaTimes, FaCheck } from "react-icons/fa";

const SupplierManagement = ({
  suppliers = [],
  handleApproveSupplier,
  handleRejectSupplier,
  statusFilter,
}) => {
  const filteredSuppliersList = suppliers.filter((s) => {
    if (!statusFilter || statusFilter === "pending") {
      return s.verificationStatus === "pending";
    } else if (statusFilter === "approved") {
      return s.verificationStatus === "approved" || s.isVerified;
    } else if (statusFilter === "rejected") {
      return s.verificationStatus === "rejected";
    }
    return true;
  });

  return (
    <div>
      {filteredSuppliersList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {statusFilter === "approved"
            ? "No approved suppliers"
            : statusFilter === "rejected"
              ? "No rejected suppliers"
              : "No pending suppliers to approve"}
        </div>
      ) : (
        filteredSuppliersList.map((supplier) => {
          const fssaiLink = `https://foscos.fssai.gov.in/verification/license?lic_no=${supplier.fssaiLicenseNumber}`;
          return (
            <div
              key={supplier.id}
              className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded mb-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-semibold text-lg">{supplier.name}</div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        supplier.verificationStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : supplier.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {supplier.verificationStatus === "approved"
                        ? "✓ Verified"
                        : supplier.verificationStatus === "rejected"
                        ? "✗ Rejected"
                        : "⏳ Pending Verification"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">FSSAI License:</span>{" "}
                    {supplier.fssaiLicenseNumber}
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Certificate:</span>{" "}
                    <a
                      href={
                        supplier.verificationDetails?.certificateFile?.url || "#"
                      }
                      download={
                        supplier.verificationDetails?.certificateFile?.name
                      }
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {supplier.verificationDetails?.certificateFile?.name ||
                        "Download"}
                    </a>
                  </div>

                  <div className="text-xs text-gray-400">
                    Submitted: {supplier.submittedDate}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <a
                    href={fssaiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <FaEye className="text-sm" />
                    Verify
                  </a>

                  {supplier.verificationStatus === "pending" && (
                    <>
                      <button
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
                        onClick={() => handleRejectSupplier(supplier.id)}
                      >
                        <FaTimes className="text-sm" />
                        Reject
                      </button>

                      <button
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2"
                        onClick={() => handleApproveSupplier(supplier.id)}
                      >
                        <FaCheck className="text-sm" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SupplierManagement;
