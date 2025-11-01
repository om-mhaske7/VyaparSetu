import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadUpiQr } from '../services/userServices';
import { 
  validatePhone, 
  validateName, 
  validateAddress, 
  validateIFSC, 
  validateAccountNumber, 
  validateUPI,
  cleanPhoneNumber,
  formatIFSC,
  formatUPI
} from '../utils/validations';

const Profile = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    upiId: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifsc: '',
      bankName: '',
      branch: '',
    },
    upiQrCode: '',
  });
  const [qrPreview, setQrPreview] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getUserProfile(userId);
        setProfile(prev => ({ ...prev, ...data }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    
    // Validate all inputs
    const nameValidation = validateName(profile.name);
    const phoneValidation = validatePhone(profile.phone);
    const addressValidation = validateAddress(profile.address);
    const upiValidation = profile.upiId ? validateUPI(profile.upiId) : { isValid: true };
    
    // Only validate bank details if any bank field is filled
    const hasBankDetails = profile.bankDetails.accountHolderName || 
                           profile.bankDetails.accountNumber || 
                           profile.bankDetails.ifsc;
    
    const accountHolderValidation = hasBankDetails ? validateName(profile.bankDetails.accountHolderName) : { isValid: true };
    const accountNumberValidation = hasBankDetails ? validateAccountNumber(profile.bankDetails.accountNumber) : { isValid: true };
    const ifscValidation = hasBankDetails ? validateIFSC(profile.bankDetails.ifsc) : { isValid: true };
    
    const errors = {};
    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    if (!addressValidation.isValid) errors.address = addressValidation.message;
    if (!upiValidation.isValid) errors.upiId = upiValidation.message;
    if (!accountHolderValidation.isValid) errors.accountHolderName = accountHolderValidation.message;
    if (!accountNumberValidation.isValid) errors.accountNumber = accountNumberValidation.message;
    if (!ifscValidation.isValid) errors.ifsc = ifscValidation.message;
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        phone: cleanPhoneNumber(profile.phone),
        address: profile.address,
        upiId: profile.upiId ? formatUPI(profile.upiId) : '',
        bankDetails: {
          ...profile.bankDetails,
          ifsc: profile.bankDetails.ifsc ? formatIFSC(profile.bankDetails.ifsc) : '',
        },
      };
      const updated = await updateUserProfile(userId, payload);
      setProfile(prev => ({ ...prev, ...updated }));
      alert('Profile saved');
    } catch (e) {
      alert('Failed to save profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpiQrUpload = async (file) => {
    if (!userId || !file) return;
    // enforce image uploads for inline preview
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG/WebP).');
      return;
    }
    try {
      const res = await uploadUpiQr(userId, file);
      setProfile(prev => ({ ...prev, upiQrCode: res.upiQrCode }));
    } catch (e) {
      alert('Failed to upload UPI QR: ' + e.message);
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    // If already absolute, return as is
    if (/^https?:\/\//i.test(path)) return path;
    // Backend serves uploads on /uploads (outside /api). Derive host from env
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const apiRoot = apiBase.replace(/\/api\/?$/, '');
    return path.startsWith('/uploads') ? `${apiRoot}${path}` : path;
  };

  if (!userId) {
    return <div className="p-6">Please login to view profile.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                className={`w-full border rounded px-3 py-2 ${fieldErrors.name ? 'border-red-500' : ''}`} 
                value={profile.name || ''} 
                onChange={(e) => {
                  setProfile(p => ({ ...p, name: e.target.value }));
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                }} 
              />
              {fieldErrors.name && <div className="text-red-500 text-xs mt-1">{fieldErrors.name}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input 
                type="tel"
                maxLength="10"
                className={`w-full border rounded px-3 py-2 ${fieldErrors.phone ? 'border-red-500' : ''}`} 
                value={profile.phone || ''} 
                onChange={(e) => {
                  setProfile(p => ({ ...p, phone: e.target.value }));
                  if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                }} 
              />
              {fieldErrors.phone && <div className="text-red-500 text-xs mt-1">{fieldErrors.phone}</div>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input 
                className={`w-full border rounded px-3 py-2 ${fieldErrors.address ? 'border-red-500' : ''}`} 
                value={profile.address || ''} 
                onChange={(e) => {
                  setProfile(p => ({ ...p, address: e.target.value }));
                  if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: undefined }));
                }} 
              />
              {fieldErrors.address && <div className="text-red-500 text-xs mt-1">{fieldErrors.address}</div>}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input 
                  className={`w-full border rounded px-3 py-2 ${fieldErrors.accountHolderName ? 'border-red-500' : ''}`} 
                  value={profile.bankDetails?.accountHolderName || ''} 
                  onChange={(e) => {
                    setProfile(p => ({ ...p, bankDetails: { ...p.bankDetails, accountHolderName: e.target.value } }));
                    if (fieldErrors.accountHolderName) setFieldErrors(prev => ({ ...prev, accountHolderName: undefined }));
                  }} 
                />
                {fieldErrors.accountHolderName && <div className="text-red-500 text-xs mt-1">{fieldErrors.accountHolderName}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input 
                  className={`w-full border rounded px-3 py-2 ${fieldErrors.accountNumber ? 'border-red-500' : ''}`} 
                  value={profile.bankDetails?.accountNumber || ''} 
                  onChange={(e) => {
                    setProfile(p => ({ ...p, bankDetails: { ...p.bankDetails, accountNumber: e.target.value } }));
                    if (fieldErrors.accountNumber) setFieldErrors(prev => ({ ...prev, accountNumber: undefined }));
                  }} 
                />
                {fieldErrors.accountNumber && <div className="text-red-500 text-xs mt-1">{fieldErrors.accountNumber}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC</label>
                <input 
                  className={`w-full border rounded px-3 py-2 ${fieldErrors.ifsc ? 'border-red-500' : ''}`} 
                  value={profile.bankDetails?.ifsc || ''} 
                  onChange={(e) => {
                    setProfile(p => ({ ...p, bankDetails: { ...p.bankDetails, ifsc: e.target.value } }));
                    if (fieldErrors.ifsc) setFieldErrors(prev => ({ ...prev, ifsc: undefined }));
                  }} 
                />
                {fieldErrors.ifsc && <div className="text-red-500 text-xs mt-1">{fieldErrors.ifsc}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={profile.bankDetails?.bankName || ''} 
                  onChange={(e) => setProfile(p => ({ ...p, bankDetails: { ...p.bankDetails, bankName: e.target.value } }))} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={profile.bankDetails?.branch || ''} 
                  onChange={(e) => setProfile(p => ({ ...p, bankDetails: { ...p.bankDetails, branch: e.target.value } }))} 
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="text-lg font-semibold">UPI Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">UPI ID</label>
              <input 
                className={`w-full border rounded px-3 py-2 ${fieldErrors.upiId ? 'border-red-500' : ''}`} 
                value={profile.upiId || ''} 
                onChange={(e) => {
                  setProfile(p => ({ ...p, upiId: e.target.value }));
                  if (fieldErrors.upiId) setFieldErrors(prev => ({ ...prev, upiId: undefined }));
                }} 
              />
              {fieldErrors.upiId && <div className="text-red-500 text-xs mt-1">{fieldErrors.upiId}</div>}
            </div>
            <div className="flex items-center gap-4">
              {profile.upiQrCode ? (
                <button type="button" onClick={() => setQrPreview(getFileUrl(profile.upiQrCode))} className="focus:outline-none">
                  <img src={getFileUrl(profile.upiQrCode)} alt="UPI QR" className="w-28 h-28 object-contain border rounded hover:shadow-md" />
                </button>
              ) : (
                <div className="w-28 h-28 border rounded flex items-center justify-center text-gray-500 text-sm">No QR</div>
              )}
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                Upload UPI QR
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && handleUpiQrUpload(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {qrPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setQrPreview("")}> 
          <div className="bg-white rounded-lg p-2 max-w-full" onClick={(e) => e.stopPropagation()}>
            <img src={qrPreview} alt="UPI QR Preview" className="max-h-[80vh] max-w-[90vw] object-contain" />
            <div className="text-center mt-2">
              <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={() => setQrPreview("")}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;


