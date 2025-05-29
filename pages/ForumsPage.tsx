
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForumThread, User } from '../types';
import { getForumThreads, createForumThread, upvoteThread } from '../services/forumService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { APP_ROUTES, ChatBubbleLeftEllipsisIcon, ArrowUpIcon, PlusCircleIcon, PLACEHOLDER_IMAGE_URL } from '../constants';
import Modal from '../components/Modal';

const ThreadCard: React.FC<{ thread: ForumThread, onUpvote: (threadId: string) => Promise<void> }> = ({ thread, onUpvote }) => {
  const [currentUpvotes, setCurrentUpvotes] = useState(thread.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(() => localStorage.getItem(`upvoted_thread_${thread.id}`) === 'true');

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if button is inside Link
    e.stopPropagation();
    if (!isUpvoted) {
      await onUpvote(thread.id);
      setCurrentUpvotes(prev => prev + 1);
      setIsUpvoted(true);
      localStorage.setItem(`upvoted_thread_${thread.id}`, 'true');
    }
  };

  return (
    <Link to={APP_ROUTES.HOME + `forums/${thread.id}`} className="block bg-slate-800 hover:bg-slate-700/70 p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-purple-500/20 group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">{thread.title}</h3>
        <button
          onClick={handleUpvoteClick}
          disabled={isUpvoted}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isUpvoted ? 'bg-green-500 text-white cursor-default' : 'bg-slate-700 group-hover:bg-purple-600 text-slate-300 hover:text-white disabled:opacity-50'
          }`}
        >
          <ArrowUpIcon className="w-4 h-4" />
          <span>{currentUpvotes}</span>
        </button>
      </div>
      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{thread.content}</p>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <div className="flex items-center">
          <img src={thread.avatarUrl || PLACEHOLDER_IMAGE_URL(24,24,thread.userId)} alt={thread.username} className="w-6 h-6 rounded-full mr-2 object-cover"/>
          <span>By {thread.username}</span>
          <span className="mx-1.5">•</span>
          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" />
            {thread.commentCount} comments
        </div>
      </div>
      {thread.tags && thread.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
            {thread.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">{tag}</span>
            ))}
        </div>
      )}
    </Link>
  );
};

const ForumsPage: React.FC = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadTags, setNewThreadTags] = useState(''); // comma-separated
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedThreads = await getForumThreads();
      setThreads(fetchedThreads);
    } catch (error) {
      console.error("Failed to fetch forum threads:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newThreadTitle.trim() || !newThreadContent.trim()) return;
    setIsSubmitting(true);
    try {
      const threadData = {
        title: newThreadTitle,
        content: newThreadContent,
        userId: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        tags: newThreadTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
      };
      const newThread = await createForumThread(threadData);
      setThreads(prev => [newThread, ...prev]); // Add to top
      setIsModalOpen(false);
      setNewThreadTitle('');
      setNewThreadContent('');
      setNewThreadTags('');
      navigate(APP_ROUTES.HOME + `forums/${newThread.id}`);
    } catch (error) {
      console.error("Failed to create thread:", error);
      // Show error in modal
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpvoteThread = async (threadId: string) => {
    try {
        await upvoteThread(threadId);
        // Optimistic update is handled in ThreadCard, or refetch threads:
        // fetchThreads(); 
    } catch(error) {
        console.error("Failed to upvote thread:", error);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-purple-400 flex items-center">
            <ChatBubbleLeftEllipsisIcon className="w-10 h-10 mr-3" /> Forum
        </h1>
        {currentUser && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Create Thread
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading threads..." />
      ) : threads.length > 0 ? (
        <div className="space-y-6">
          {threads.map(thread => (
            <ThreadCard key={thread.id} thread={thread} onUpvote={handleUpvoteThread} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
            <ChatBubbleLeftEllipsisIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No forum threads yet. Be the first to start a discussion!</p>
            {!currentUser && <p className="text-slate-400 mt-2">Please <Link to={APP_ROUTES.HOME} className="text-purple-400 hover:underline">sign in</Link> to create a thread.</p>}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Thread" size="lg">
        <form onSubmit={handleCreateThread} className="space-y-4">
          <div>
            <label htmlFor="threadTitle" className="block text-sm font-medium text-slate-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="threadTitle" value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-slate-100" />
          </div>
          <div>
            <label htmlFor="threadContent" className="block text-sm font-medium text-slate-300 mb-1">Content <span className="text-red-500">*</span></label>
            <textarea id="threadContent" value={newThreadContent} onChange={(e) => setNewThreadContent(e.target.value)} required rows={5} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-slate-100 resize-none" />
          </div>
           <div>
            <label htmlFor="threadTags" className="block text-sm font-medium text-slate-300 mb-1">Tags (comma-separated, optional)</label>
            <input type="text" id="threadTags" value={newThreadTags} onChange={(e) => setNewThreadTags(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-slate-100" placeholder="e.g., discussion, recommendation, help"/>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors disabled:opacity-60">
              {isSubmitting ? <LoadingSpinner size="sm"/> : 'Create Thread'}
            </button>
          </div>
        </form>
      </Modal>
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

export default ForumsPage;
    