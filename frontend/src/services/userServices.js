import API from "../api/axios";
const API_BASE = "/users";

export const getVerificationStatusById = async (userId) => {
  const res = await API.get(`${API_BASE}/verification-status/${userId}`);
  return res.data;
};


export const updateVerificationStatus = async (userId, status) => {
  const res = await API.patch(`${API_BASE}/verification-status/${userId}`, {
    verificationStatus: status,
  });
  return res.data;
};

export const getUserProfile = async (userId) => {
  const res = await API.get(`${API_BASE}/get-user/${userId}`);
  return res.data;
};

export const updateUserProfile = async (userId, data) => {
  const res = await API.put(`${API_BASE}/update-user/${userId}`, data);
  return res.data;
};

export const uploadUpiQr = async (userId, file) => {
  const form = new FormData();
  form.append('upiQr', file);
  const res = await API.post(`${API_BASE}/${userId}/upi-qr`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const searchSuppliersByName = async (name) => {
  const res = await API.get(`${API_BASE}/suppliers/search`, {
    params: { name }
  });
  return res.data;
};