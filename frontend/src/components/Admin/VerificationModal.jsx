import React from "react";
import { FaTimes, FaDownload } from "react-icons/fa";

const VerificationModal = ({
  showVerificationModal,
  selectedSupplier,
  setShowVerificationModal,
  handleApproveVerification,
  handleRejectVerification,
  handleDownloadFile,
  getFssaiVerificationLink
}) => {
  if (!showVerificationModal || !selectedSupplier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Verification Details - {selectedSupplier.name}
          </h2>
          <button
            onClick={() => setShowVerificationModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.businessName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Address</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.businessAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.contactPerson}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.email}</p>
                </div>
              </div>
            </div>

            {/* Certificate Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Certificate Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certificate Type</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.certificateType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">FSSAI Number / License Number</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.fssaiNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted Date</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.submittedDate}</p>
                </div>
                {selectedSupplier.verificationDetails.verifiedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verified Date</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.verifiedDate}</p>
                  </div>
                )}
                {selectedSupplier.verificationDetails.rejectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rejected Date</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedSupplier.verificationDetails.rejectedDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate File */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Certificate File</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <FaDownload className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedSupplier.verificationDetails.certificateFile.name}</p>
                    <p className="text-sm text-gray-500">{selectedSupplier.verificationDetails.certificateFile.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadFile(selectedSupplier.verificationDetails.certificateFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaDownload className="text-sm" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Verification Links */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Verification Resources</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>FSSAI License Verification:</strong> Check the license number on the official FSSAI portal
              </p>
              <a
                href={getFssaiVerificationLink(selectedSupplier.fssaiLicenseNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Verify FSSAI License: {selectedSupplier.fssaiLicenseNumber}
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {selectedSupplier.verificationStatus === "pending" && (
              <>
                <button
                  onClick={() => handleRejectVerification(selectedSupplier.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Reject Verification
                </button>
                <button
                  onClick={() => handleApproveVerification(selectedSupplier.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Approve Verification
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal; 