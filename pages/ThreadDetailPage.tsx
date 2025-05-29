
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ForumThread, ForumComment as CommentType, User } from '../types';
import { getForumThreadById, getCommentsForThread, addCommentToThread, upvoteThread, upvoteForumComment } from '../services/forumService';
import LoadingSpinner from '../components/LoadingSpinner';
import CommentSection from '../components/CommentSection'; // Re-using generic comment section
import { useAuth } from '../hooks/useAuth';
import { APP_ROUTES, ArrowUpIcon, ChatBubbleLeftEllipsisIcon, PLACEHOLDER_IMAGE_URL } from '../constants';

const ThreadDetailPage: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { currentUser } = useAuth();

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isThreadUpvoted, setIsThreadUpvoted] = useState(() => localStorage.getItem(`upvoted_thread_${threadId}`) === 'true');


  const fetchThreadAndComments = useCallback(async () => {
    if (!threadId) return;
    setIsLoadingThread(true);
    setIsLoadingComments(true);
    setError(null);
    try {
      const [threadData, commentsData] = await Promise.all([
        getForumThreadById(threadId),
        getCommentsForThread(threadId)
      ]);
      
      if (threadData) {
        setThread(threadData);
      } else {
        setError('Thread not found.');
      }
      setComments(commentsData);
    } catch (err) {
      console.error("Failed to fetch thread details:", err);
      setError('Failed to load thread. Please try again.');
    } finally {
      setIsLoadingThread(false);
      setIsLoadingComments(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThreadAndComments();
  }, [fetchThreadAndComments]);

  const handleUpvoteThread = async () => {
    if (!thread || isThreadUpvoted) return;
    try {
      const updatedThread = await upvoteThread(thread.id);
      if (updatedThread) {
        setThread(prevThread => prevThread ? { ...prevThread, upvotes: updatedThread.upvotes } : null);
        setIsThreadUpvoted(true);
        localStorage.setItem(`upvoted_thread_${thread.id}`, 'true');
      }
    } catch (err) {
      console.error("Failed to upvote thread:", err);
    }
  };

  const handleAddComment = async (itemId: string, text: string, user: User): Promise<CommentType | undefined> => {
    if (!thread) return undefined; // itemId is threadId here
    const newCommentData = {
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        text,
        // upvotes: 0, // Handled by service
    };
    const addedComment = await addCommentToThread(thread.id, newCommentData);
    if (addedComment) {
        setComments(prevComments => [addedComment, ...prevComments]); // Add to top for immediate visibility
    }
    return addedComment;
  };
  
  const handleUpvoteComment = async (commentId: string) => {
    try {
        await upvoteForumComment(commentId);
        // CommentCard handles its own optimistic update for upvotes count
        // Optionally, refetch all comments if strict data consistency is needed, but less ideal UX
        // setComments(prev => prev.map(c => c.id === commentId ? {...c, upvotes: c.upvotes+1} : c));
    } catch (err) {
        console.error("Failed to upvote comment:", err);
    }
  };


  if (isLoadingThread) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading thread..." /></div>;
  if (error) return <div className="text-center text-red-400 text-xl py-10">{error}</div>;
  if (!thread) return <div className="text-center text-slate-400 text-xl py-10">Thread data is unavailable.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-slate-800/50 shadow-xl rounded-lg p-6 md:p-8 animate-fadeIn">
      <header className="mb-6 pb-6 border-b border-slate-700">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-400 mb-3">{thread.title}</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-slate-400 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <img src={thread.avatarUrl || PLACEHOLDER_IMAGE_URL(32,32,thread.userId)} alt={thread.username} className="w-8 h-8 rounded-full mr-2 object-cover"/>
            <span>Posted by <span className="font-semibold text-purple-300">{thread.username}</span> on {new Date(thread.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvoteThread}
              disabled={isThreadUpvoted}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isThreadUpvoted ? 'bg-green-500 text-white cursor-default' : 'bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white disabled:opacity-50'
              }`}
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span>{thread.upvotes} Upvotes</span>
            </button>
            <div className="flex items-center text-slate-400">
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1"/>
                <span>{comments.length} Comments</span>
            </div>
          </div>
        </div>
         {thread.tags && thread.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
                {thread.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs rounded-full font-medium">{tag}</span>
                ))}
            </div>
        )}
      </header>

      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-200 mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: thread.content.replace(/\n/g, '<br />') }}>
      </div>

      <CommentSection
        itemId={thread.id} // threadId
        commentsData={comments}
        onAddComment={handleAddComment}
        onUpvoteComment={handleUpvoteComment}
        isLoading={isLoadingComments}
      />
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

export default ThreadDetailPage;
    