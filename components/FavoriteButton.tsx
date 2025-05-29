
import React from 'react';
import { HeartIcon } from '../constants';
import { useAuth } from '../hooks/useAuth';

interface FavoriteButtonProps {
  toolId: string;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ toolId, className }) => {
  const { currentUser, addFavoriteTool, removeFavoriteTool, isFavorite } = useAuth(); // Corrected destructuring
  const isToolFavorited = currentUser ? isFavorite(toolId) : false;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to favorite tools.");
      return;
    }
    
    try {
      if (isToolFavorited) {
        await removeFavoriteTool(toolId);
      } else {
        await addFavoriteTool(toolId);
      }
    } catch (error) {
      console.error("Failed to update favorite:", error);
      alert("Failed to update favorite. Please try again.");
    }
  };

  return (
    <button
      onClick={handleFavoriteToggle}
      aria-label={isToolFavorited ? "Remove from favorites" : "Add to favorites"}
      className={`p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#6C4DFF] ${className}`}
    >
      <HeartIcon
        className={`w-5 h-5 ${isToolFavorited ? 'fill-[#6C4DFF] text-[#6C4DFF]' : 'text-slate-400 hover:text-[#6C4DFF]'}`}
      />
    </button>
  );
};

export default FavoriteButton;