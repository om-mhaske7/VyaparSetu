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