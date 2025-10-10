import React, { useState, useEffect } from "react";
import SummaryCards from "./Admin/SummaryCards";
import {
  getPendingVerifications,
  getApprovedVerifications,
  getRejectedVerifications,
  rejectSupplier,
  verifySupplier,
} from "../services/adminServices";
import SupplierManagement from "./Admin/SupplierManagement";
import VerificationModal from "./Admin/VerificationModal";

const Admin = () => {
  const [tab, setTab] = useState("Pending");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [pendingSuppliers, setPendingSuppliers] = useState([]);
  const [acceptedSuppliers, setAcceptedSuppliers] = useState([]);
  const [rejectedSuppliers, setRejectedSuppliers] = useState([]);

  const formatSuppliers = (suppliers) => {
    return suppliers.map((s) => ({
      id: s._id,
      name: s.name,
      fssaiLicenseNumber: s.kycDocs?.[0] || "N/A",
      submittedDate: new Date(s.createdAt).toISOString().split("T")[0],
      status: s.verificationStatus,
      verificationStatus: s.verificationStatus,
      verificationDetails: {
        businessName: s.name,
        fssaiNumber: s.kycDocs?.[0] || "",
        certificateType: "FSSAI",
        businessAddress: "N/A",
        contactPerson: s.name,
        phoneNumber: s.phone || "N/A",
        email: s.email,
        certificateFile: {
          name: s.kycDocs?.[0] || "Document",
          url: "#", // Replace with actual download URL if available
          type: "application/pdf",
        },
        submittedDate: new Date(s.createdAt).toISOString().split("T")[0],
        verifiedDate: s.updatedAt ? new Date(s.updatedAt).toISOString().split("T")[0] : null,
        verifiedBy: "Admin",
      },
    }));
  };

  // 🟢 Fetch All Supplier Verification States
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const [pending, approved, rejected] = await Promise.all([
          getPendingVerifications(),
          getApprovedVerifications(),
          getRejectedVerifications(),
        ]);

        console.log("Approved", approved);
        console.log("Rejected", rejected);


        setPendingSuppliers(formatSuppliers(pending));
        setAcceptedSuppliers(formatSuppliers(approved));
        setRejectedSuppliers(formatSuppliers(rejected));
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  // 🔵 Supplier Verification Handlers
 const handleApproveSupplier = async (supplierId) => {
  try {
    await verifySupplier(supplierId, "approved");
    setPendingSuppliers(prev =>
      prev.filter(supplier => supplier.id !== supplierId)
    );

    // Fetch updated approved suppliers from backend
    const approved = await getApprovedVerifications();
    setAcceptedSuppliers(formatSuppliers(approved));
  } catch (err) {
    console.error("Error approving supplier:", err);
  }
};


  const handleRejectSupplier = async (supplierId) => {
    try {
      await rejectSupplier(supplierId);

      // Remove from pending
      setPendingSuppliers(prev =>
        prev.filter(supplier => supplier.id !== supplierId)
      );

      // Re-fetch rejected list from backend
      const rejected = await getRejectedVerifications();
      setRejectedSuppliers(formatSuppliers(rejected));
    } catch (err) {
      console.error("Error rejecting supplier:", err);
    }
  };


  // 🟡 Modal Verification Handlers
  const handleApproveVerification = (supplierId) => {
    setPendingSuppliers(prev =>
      prev.map(supplier =>
        supplier.id === supplierId
          ? {
            ...supplier,
            verificationStatus: "approved",
            verificationDetails: {
              ...supplier.verificationDetails,
              verifiedDate: new Date().toISOString().split("T")[0],
              verifiedBy: "Admin",
            },
          }
          : supplier
      )
    );
    setShowVerificationModal(false);
  };

  const handleRejectVerification = (supplierId) => {
    setPendingSuppliers(prev =>
      prev.map(supplier =>
        supplier.id === supplierId
          ? {
            ...supplier,
            verificationStatus: "rejected",
            verificationDetails: {
              ...supplier.verificationDetails,
              rejectedDate: new Date().toISOString().split("T")[0],
              rejectedBy: "Admin",
            },
          }
          : supplier
      )
    );
    setShowVerificationModal(false);
  };

  // Utility
  const handleDownloadFile = (file) => {
    alert(`Downloading ${file.name}`);
  };

  const getFssaiVerificationLink = (fssaiNumber) => {
    return `https://foscos.fssai.gov.in/verification/license?lic_no=${fssaiNumber}`;
  };

  // 🟣 Bundle and Issue Handlers (demo logic)
  const [bundles, setBundles] = useState([]);
  const [issues, setIssues] = useState([]);
  const handleToggleBundle = () => { };
  const handleUpdateIssueStatus = () => { };

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <SummaryCards pendingSuppliers={pendingSuppliers} issues={issues} />

      <div className="px-2 sm:px-4 md:px-8">
        <div className="bg-white rounded-t-lg shadow">
          <div className="flex border-b overflow-x-auto no-scrollbar">
            {["Pending", "Accepted", "Rejected", "Bundles", "Issues"].map(tabName => (
              <button
                key={tabName}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base whitespace-nowrap ${tab === tabName
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

      <div className="bg-white rounded-b-lg shadow mx-0 mb-8 p-3 sm:p-6 mt-0">
        {tab === "Pending" && (
          <SupplierManagement
            suppliers={pendingSuppliers}
            handleRejectSupplier={handleRejectSupplier}
            handleApproveSupplier={handleApproveSupplier}
          />
        )}

        {tab === "Accepted" && (
          <SupplierManagement
            suppliers={acceptedSuppliers}
            handleRejectSupplier={() => { }}
            handleApproveSupplier={() => { }}
            statusFilter="accepted"
          />
        )}

        {tab === "Rejected" && (
          <SupplierManagement
            suppliers={rejectedSuppliers}
            handleRejectSupplier={() => { }}
            handleApproveSupplier={() => { }}
            statusFilter="rejected"
          />
        )}



      </div>

      <VerificationModal
        showVerificationModal={showVerificationModal}
        selectedSupplier={selectedSupplier}
        setShowVerificationModal={setShowVerificationModal}
        handleApproveVerification={handleApproveVerification}
        handleRejectVerification={handleRejectVerification}
        handleDownloadFile={handleDownloadFile}
        getFssaiVerificationLink={getFssaiVerificationLink}
      />
    </div>
  );
};

export default Admin;