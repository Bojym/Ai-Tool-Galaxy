
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserCircleIcon, APP_ROUTES } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading profile..." /></div>;
  }

  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <UserCircleIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-purple-400 mb-4">Profile</h1>
        <p className="text-slate-300 text-lg">Please <Link to={APP_ROUTES.HOME} className="text-purple-400 hover:underline">sign in</Link> to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 shadow-xl rounded-lg p-8 animate-fadeIn">
      <div className="flex flex-col items-center">
        <img 
          src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random&color=fff&size=128`} 
          alt={`${currentUser.username}'s avatar`}
          className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg mb-6"
        />
        <h1 className="text-4xl font-bold text-purple-400 mb-2">{currentUser.username}</h1>
        {currentUser.email && <p className="text-slate-400 text-lg mb-4">{currentUser.email}</p>}
        {currentUser.isAdmin && (
          <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-sm font-semibold rounded-full mb-6">
            Administrator
          </span>
        )}
        
        <div className="w-full mt-6 pt-6 border-t border-slate-700">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4">Profile Information</h2>
          <div className="space-y-3 text-slate-200">
            <p><strong>User ID:</strong> {currentUser.id}</p>
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Role:</strong> {currentUser.isAdmin ? 'Admin' : 'User'}</p>
            <p><strong>Number of Favorites:</strong> {currentUser.favorites.length}</p>
            {/* Add more profile details here if needed */}
          </div>
        </div>

        {/* Placeholder for future actions like "Edit Profile" */}
        <div className="mt-8">
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-md transition-colors">
            Edit Profile (Coming Soon)
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
    