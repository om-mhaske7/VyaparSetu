import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    try {
      // TODO: hook to backend delete endpoint when available
      alert('Account deletion is not yet connected to backend. Logging out for now.');
      logout();
      navigate('/');
    } catch (e) {
      alert('Failed to delete account: ' + e.message);
    } finally {
      setConfirmingDelete(false);
    }
  };

  if (!user) {
    return <div className="p-6">Please login to access settings.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-2">Account</h3>
        <div className="text-sm text-gray-700 mb-4">Logged in as <span className="font-medium">{user.name}</span></div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Edit Profile
          </button>
          <button
            onClick={handleDeleteAccount}
            className={`px-4 py-2 rounded ${confirmingDelete ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'} hover:bg-red-200`}
          >
            {confirmingDelete ? 'Click again to confirm delete' : 'Delete Account'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-2">Security</h3>
        <div className="text-sm text-gray-700 mb-4">You can logout from all devices.</div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="px-4 py-2 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;


