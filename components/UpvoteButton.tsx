
import React, { useState } from 'react';
import { ArrowUpIcon } from '../constants';

interface UpvoteButtonProps {
  initialUpvotes: number;
  onUpvote: () => Promise<void>; 
  isUpvoted?: boolean; 
  itemId: string; 
}

const UpvoteButton: React.FC<UpvoteButtonProps> = ({ initialUpvotes, onUpvote, itemId }) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [isClicked, setIsClicked] = useState(false); 
  const [hasUpvoted, setHasUpvoted] = useState(() => {
     return localStorage.getItem(`upvoted_${itemId}`) === 'true';
  });


  const handleUpvoteClick = async () => {
    if (isClicked || hasUpvoted) return; 
    setIsClicked(true);
    try {
      await onUpvote();
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      localStorage.setItem(`upvoted_${itemId}`, 'true'); 
    } catch (error) {
      console.error("Failed to upvote:", error);
    } finally {
      setIsClicked(false);
    }
  };

  return (
    <button
      onClick={handleUpvoteClick}
      disabled={isClicked || hasUpvoted}
      className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium border
                  ${hasUpvoted 
                    ? 'bg-purple-50 text-[#6C4DFF] border-[#6C4DFF] cursor-default' // Active state with primary accent
                    : 'bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-[#6C4DFF] border-slate-300 hover:border-[#6C4DFF] disabled:opacity-60 disabled:cursor-not-allowed'}`}
    >
      <ArrowUpIcon className={`w-4 h-4`} />
      <span>{upvotes}</span>
      {hasUpvoted && <span className="text-xs">(Upvoted)</span>}
    </button>
  );
};

export default UpvoteButton;