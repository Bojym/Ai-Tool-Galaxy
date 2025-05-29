
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tool } from '../types';
import { getToolById } from '../services/toolService'; // Assuming you fetch full tool details
import ToolCard from '../components/ToolCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { APP_ROUTES, HeartIcon } from '../constants';

const FavoritesPage: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  useEffect(() => {
    const fetchFavoriteTools = async () => {
      if (!currentUser || currentUser.favorites.length === 0) {
        setFavoriteTools([]);
        setIsLoadingTools(false);
        return;
      }

      setIsLoadingTools(true);
      try {
        const toolPromises = currentUser.favorites.map(toolId => getToolById(toolId));
        const resolvedTools = await Promise.all(toolPromises);
        setFavoriteTools(resolvedTools.filter((tool): tool is Tool => tool !== undefined));
      } catch (error) {
        console.error("Failed to fetch favorite tools:", error);
        // Handle error display if necessary
      } finally {
        setIsLoadingTools(false);
      }
    };

    if (!authLoading) { // Only fetch once auth state is resolved
        fetchFavoriteTools();
    }
  }, [currentUser, authLoading]);

  if (authLoading || isLoadingTools) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading your favorites..." /></div>;
  }

  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <HeartIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-purple-400 mb-4">Your Favorites</h1>
        <p className="text-slate-300 text-lg">Please log in to see your favorited tools.</p>
        {/* Optionally, add a login button here */}
      </div>
    );
  }

  if (currentUser.favorites.length === 0) {
    return (
      <div className="text-center py-10">
        <HeartIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-purple-400 mb-4">No Favorites Yet</h1>
        <p className="text-slate-300 text-lg mb-6">You haven't added any tools to your favorites. Explore and find some!</p>
        <Link 
            to={APP_ROUTES.HOME}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg"
        >
            Discover Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold text-purple-400 mb-8 flex items-center">
        <HeartIcon className="w-10 h-10 mr-3 text-pink-500" /> Your Favorite Tools
      </h1>
      {favoriteTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        // This case might be hit briefly if favorites array has IDs but tools haven't loaded
        // Or if tool IDs in favorites are invalid / tools were deleted
        <p className="text-slate-400">Could not load details for some favorite tools, or your list is empty.</p>
      )}
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

export default FavoritesPage;
    