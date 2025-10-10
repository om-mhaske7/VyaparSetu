import API from "../api/axios";
const API_BASE = "/admin";

// Get all pending supplier verifications
export const getPendingVerifications = async () => {
  const res = await API.get(`${API_BASE}/pending-verifications`);
  console.log("Res:", res);
  return res.data.suppliers;
};

export const getRejectedVerifications = async () => {
  const res = await API.get(`${API_BASE}/rejected-verifications`);  
  console.log("Res:", res);
  return res.data.suppliers; 
};

export const getApprovedVerifications = async () => {
  const res = await API.get(`${API_BASE}/approved-verifications`);
  console.log("Res:", res);
 return res.data.suppliers; 
};

// Approve or reject supplier
export const verifySupplier = async (supplierId, status) => {
  try {
    const response = await API.put(`${API_BASE}/verify-supplier/${supplierId}`, {
      status: status,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Get count of pending verifications
export const getPendingVerificationCount = async () => {
  const res = await API.get(`${API_BASE}/verification-pending-count`);
  return res.data.count;
};

// Get count of rejected verifications
export const getRejectedVerificationCount = async () => {
  const res = await API.get(`${API_BASE}/verification-rejected-count`);
  return res.data.count;
};

export const getVerifiedSuppliers = async () => {
  const response = await API.get(`/admin/verified-suppliers`);
  return response.data.suppliers;
};

export const rejectSupplier = async (id) => {
  return verifySupplier(id, "rejected");
};

