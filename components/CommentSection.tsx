
import React, { useState, useEffect } from 'react';
import { User, ToolComment, ForumComment } from '../types'; 
import { useAuth } from '../hooks/useAuth';
import { PLACEHOLDER_IMAGE_URL, ArrowUpIcon } from '../constants'; 
import LoadingSpinner from './LoadingSpinner';

type CommentType = ToolComment | ForumComment; 

interface CommentSectionProps<T extends CommentType> {
  itemId: string; 
  commentsData: T[];
  onAddComment: (itemId: string, text: string, user: User) => Promise<T | undefined>;
  onUpvoteComment?: (commentId: string) => Promise<void>; 
  isLoading: boolean;
}

const CommentCard: React.FC<{ comment: CommentType, onUpvote?: (commentId: string) => Promise<void> }> = ({ comment, onUpvote }) => {
  const [currentUpvotes, setCurrentUpvotes] = useState(comment.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false); 

  const handleUpvote = async () => {
    if (onUpvote && !isUpvoted) {
      await onUpvote(comment.id);
      setCurrentUpvotes(prev => prev + 1);
      setIsUpvoted(true);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E7EB]">
      <div className="flex items-start space-x-3">
        <img 
          src={comment.avatarUrl || PLACEHOLDER_IMAGE_URL(40,40,comment.userId)} 
          alt={`${comment.username}'s avatar`}
          className="w-9 h-9 rounded-full object-cover border border-slate-200" 
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#0F172A] text-sm">{comment.username}</p>
            <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
          </div>
          <p className="text-[#475569] mt-1 text-sm">{comment.text}</p>
        </div>
      </div>
      {onUpvote && (
          <div className="mt-2 flex justify-end">
            <button 
                onClick={handleUpvote}
                disabled={isUpvoted}
                className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${isUpvoted ? 'text-green-600 cursor-default' : 'text-slate-500 hover:text-[#6C4DFF] disabled:opacity-50'}`}
            >
                <ArrowUpIcon className="w-3 h-3" />
                <span>{currentUpvotes}</span>
            </button>
          </div>
        )}
    </div>
  );
};


const CommentSection = <T extends CommentType,>({ itemId, commentsData, onAddComment, onUpvoteComment, isLoading }: CommentSectionProps<T>) => {
  const { currentUser } = useAuth();
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<T[]>(commentsData);

  useEffect(() => {
    // Sort comments by creation date, newest first
    setComments([...commentsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [commentsData]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const addedComment = await onAddComment(itemId, newCommentText, currentUser);
      if (addedComment) {
        setComments(prevComments => [addedComment, ...prevComments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setNewCommentText('');
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="mt-8 py-6 border-t border-[#E5E7EB]">
      <h3 className="text-xl font-semibold text-[#0F172A] mb-6">Comments ({comments.length})</h3>
      
      {currentUser && (
        <form onSubmit={handleCommentSubmit} className="mb-8 p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full p-3 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#6C4DFF] focus:border-[#6C4DFF] outline-none text-[#0F172A] placeholder-slate-400 resize-none text-sm"
            required
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newCommentText.trim()}
              className="px-5 py-2 bg-[#6C4DFF] hover:bg-purple-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}
      {!currentUser && <p className="mb-6 text-[#475569] text-sm">Please <button onClick={() => alert("Login functionality to be implemented. For now, try logging in via Navbar with 'DemoUser' or 'AdminUser'.")} className="text-[#6C4DFF] hover:underline">log in</button> to post a comment.</p>}

      {isLoading && <LoadingSpinner text="Loading comments..." />}
      {!isLoading && comments.length === 0 && (
        <p className="text-[#475569] text-sm">No comments yet. Be the first to share your thoughts!</p>
      )}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} onUpvote={onUpvoteComment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;