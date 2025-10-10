import React, { useEffect, useState } from "react";
import {
  getVerificationStatusById,
  updateVerificationStatus,
} from "../../services/userServices";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

const VerificationStatus = ({
  userId,
  showVerificationForm,
  setShowVerificationForm,
  verificationForm,
  handleVerificationFormChange,
  handleVerificationSubmit,
  submittingVerification,
  onSuccessfulSubmit,
}) => {
  const [verificationStatus, setVerificationStatus] = useState("pending");

  const fetchStatus = async () => {
    try {
      const data = await getVerificationStatusById(userId);
      const status = data.verificationStatus;

      if (status === "approved") {
        setVerificationStatus("verified");
      } else if (status === "rejected") {
        setVerificationStatus("rejected");
      } else {
        setVerificationStatus("pending");
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      setVerificationStatus("pending"); // fallback to pending
    }
  };

  useEffect(() => {
    if (userId) {
      fetchStatus(); // initial fetch
      const interval = setInterval(fetchStatus, 5000); // polling
      return () => clearInterval(interval);
    }
  }, [userId]);

  useEffect(() => {
    if (!showVerificationForm && userId) {
      fetchStatus();
    }
  }, [showVerificationForm]);

  return (
    <>
      {verificationStatus === "pending" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-8 mt-6 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Verification Required
                </h3>
                <button
                  onClick={() => setShowVerificationForm(true)}
                  className="bg-yellow-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Verify Now
                </button>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please verify your account to access all features and build
                  trust with customers.
                </p>
                <p className="mt-1 text-xs">
                  <strong>Certificate Verification Options:</strong> FSSAI
                  license verification available at{" "}
                  <a
                    href="https://foscos.fssai.gov.in/verification/license"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    foscos.fssai.gov.in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === "rejected" && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-8 mt-6 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800">
                  Verification Rejected
                </h3>
                <button
                  onClick={async () => {
                    try {
                      await updateVerificationStatus(userId, "pending");
                      setVerificationStatus("pending");
                    } catch (error) {
                      console.error("Failed to update status:", error);
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Resubmit
                </button>
              </div>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Your verification was not approved. Please review your
                  submitted documents and resubmit.
                </p>
                <p className="mt-1 text-xs">
                  Make sure your FSSAI license is valid and all information is
                  accurate.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === "verified" && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-8 mt-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaCheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800">
              ✓ Account Verified
            </span>
          </div>
        </div>
      )}

      {/* Verification Form Modal */}
      {showVerificationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Account Verification
              </h2>
              <button
                onClick={() => setShowVerificationForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const success = await handleVerificationSubmit(e);
                if (success) {
                  await fetchStatus();
                  setShowVerificationForm(false);
                  if (onSuccessfulSubmit) {
                    onSuccessfulSubmit();
                  }
                }
              }}
              className="p-6"
            >
              {/* Form fields remain unchanged */}
              {/* ... form content here (unchanged from your code) ... */}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={verificationForm.businessName}
                      onChange={handleVerificationFormChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Type *
                    </label>
                    <select
                      name="certificateType"
                      value={verificationForm.certificateType}
                      onChange={handleVerificationFormChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                      required
                    >
                      <option value="FSSAI">FSSAI License</option>
                      <option value="BMC">BMC License</option>
                      <option value="Other">Other Local Authority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FSSAI Number / License Number *
                  </label>
                  <input
                    type="text"
                    name="fssaiNumber"
                    value={verificationForm.fssaiNumber}
                    onChange={handleVerificationFormChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verify FSSAI license at{" "}
                    <a
                      href="https://foscos.fssai.gov.in/verification/license"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      foscos.fssai.gov.in
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address *
                  </label>
                  <textarea
                    name="businessAddress"
                    value={verificationForm.businessAddress}
                    onChange={handleVerificationFormChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={verificationForm.contactPerson}
                      onChange={handleVerificationFormChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={verificationForm.phoneNumber}
                      onChange={handleVerificationFormChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={verificationForm.email}
                    onChange={handleVerificationFormChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Certificate/License *
                  </label>
                  <input
                    type="file"
                    name="certificateFile"
                    onChange={handleVerificationFormChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload FSSAI license, BMC certificate, or other relevant
                    documents (PDF, JPG, PNG)
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVerificationForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerification}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
                >
                  {submittingVerification ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationStatus;
