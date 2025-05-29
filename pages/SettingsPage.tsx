import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import { UserCircleIcon, CogIcon, PlusIcon, XMarkIcon, APP_ROUTES } from '../constants'; // Added PlusIcon, XMarkIcon
// Fix: Replaced CogIcon with Cog6ToothIcon as CogIcon is not exported from constants.
import { UserCircleIcon, Cog6ToothIcon, PlusIcon, XMarkIcon, APP_ROUTES } from '../constants'; // Added PlusIcon, XMarkIcon
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const SettingsPage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // State for custom notification keywords
  const [notificationKeywords, setNotificationKeywords] = useState<string[]>(['']);

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...notificationKeywords];
    newKeywords[index] = value;
    setNotificationKeywords(newKeywords);
  };

  const addKeywordInput = () => {
    setNotificationKeywords([...notificationKeywords, '']);
  };

  const removeKeywordInput = (index: number) => {
    if (notificationKeywords.length > 1) {
      setNotificationKeywords(notificationKeywords.filter((_, i) => i !== index));
    } else {
      setNotificationKeywords(['']); // Keep one empty if it's the last one
    }
  };

  const handlePasswordChange = () => {
    alert("Password change functionality coming soon!");
  };

  const handleDeleteAccount = () => {
    // In a real app, this would involve more steps and backend calls
    alert(`Account for ${currentUser?.username} would be deleted. This is a mock action.`);
    setShowDeleteConfirmModal(false);
    // Potentially call logout or navigate away
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading settings..." /></div>;
  }

  if (!currentUser) {
    return (
      <div className="text-center py-10 max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-slate-200 animate-fadeInPage">
        {/* Fix: Replaced CogIcon with Cog6ToothIcon */}
        <Cog6ToothIcon className="w-12 h-12 text-[#6C4DFF] mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-3">Settings</h1>
        <p className="text-[#475569] text-sm">
          Please <Link to={APP_ROUTES.HOME} className="text-[#6C4DFF] hover:underline font-medium">sign in</Link> to manage your settings.
        </p>
      </div>
    );
  }
  
  const inputClass = "w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#6C4DFF] focus:border-[#6C4DFF] outline-none text-[#0F172A] placeholder-slate-400 text-sm";
  const labelClass = "block text-sm font-medium text-[#475569] mb-1";

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fadeInPage space-y-8">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-8 text-center">Settings</h1>

      {/* Account Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Account Information</h2>
        <div className="space-y-3">
          <p><strong className="text-[#475569]">Username:</strong> {currentUser.username}</p>
          <p><strong className="text-[#475569]">Email:</strong> {currentUser.email || 'Not provided'}</p>
          <Link 
            to={APP_ROUTES.PROFILE}
            className="inline-block mt-2 px-4 py-2 text-sm bg-[#6C4DFF] hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
          >
            Manage Profile
          </Link>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Appearance</h2>
        <p className="text-[#475569] text-sm">Theme settings (e.g., Dark Mode) coming soon!</p>
        {/* Example toggle (non-functional) */}
        <div className="mt-3 flex items-center justify-between p-3 bg-slate-50 rounded-md">
            <span className="text-[#475569] text-sm">Dark Mode</span>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="darkToggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300" disabled/>
                <label htmlFor="darkToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
            </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Notifications</h2>
        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#6C4DFF] focus:ring-[#6C4DFF] focus:ring-offset-1" />
            <span className="text-[#475569] text-sm">Email notifications for new comments on your posts</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#6C4DFF] focus:ring-[#6C4DFF] focus:ring-offset-1" defaultChecked/>
            <span className="text-[#475569] text-sm">Newsletter updates</span>
          </label>
        </div>

        {/* Custom Notification Keywords */}
        <div>
            <h3 className={`${labelClass} font-semibold text-base mb-2 pt-4 border-t border-slate-200`}>Custom Notification Keywords</h3>
            <p className="text-xs text-slate-500 mb-3">Get notified for specific keywords (mock implementation).</p>
            {notificationKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input 
                        type="text" 
                        value={keyword} 
                        onChange={(e) => handleKeywordChange(index, e.target.value)} 
                        className={inputClass} 
                        placeholder={`Keyword ${index + 1}`} 
                    />
                    <button 
                        type="button" 
                        onClick={() => removeKeywordInput(index)} 
                        className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100 transition-colors" 
                        aria-label="Remove keyword"
                    >
                        <XMarkIcon className="w-5 h-5"/>
                    </button>
                </div>
            ))}
            <button 
                type="button" 
                onClick={addKeywordInput} 
                className="mt-1 text-sm text-[#6C4DFF] hover:text-purple-700 font-medium flex items-center px-3 py-1.5 border border-slate-300 hover:border-purple-400 rounded-md bg-slate-50 hover:bg-purple-50 transition-colors"
            >
                <PlusIcon className="w-4 h-4 mr-1.5"/> Add Keyword
            </button>
        </div>
      </div>

      {/* Account Actions Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Account Actions</h2>
        <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
          <button 
            onClick={handlePasswordChange}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium rounded-md border border-slate-300 transition-colors"
          >
            Change Password
          </button>
          <button 
            onClick={() => setShowDeleteConfirmModal(true)}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      <Modal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} title="Confirm Account Deletion">
        <p className="text-[#475569] mb-4 text-sm">Are you sure you want to delete your account? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={() => setShowDeleteConfirmModal(false)}
            className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-[#0F172A] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDeleteAccount}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Yes, Delete Account
          </button>
        </div>
      </Modal>
      
      <style>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInPage { animation: fadeInPage 0.5s ease-out forwards; }
        .toggle-checkbox:checked {
            right: 0;
            border-color: #6C4DFF; /* purple-500 */
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #6C4DFF; /* purple-500 */
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;