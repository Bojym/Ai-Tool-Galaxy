
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tool, ToolComment as CommentType, User } from '../types';
import { getToolById, upvoteTool, addCommentToTool } from '../services/toolService';
import LoadingSpinner from '../components/LoadingSpinner';
import ScreenshotCarousel from '../components/ScreenshotCarousel';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../hooks/useAuth';
import { ArrowUpIcon, HeartIcon, Cog6ToothIcon, AcademicCapIcon, SparklesIcon, PLACEHOLDER_IMAGE_URL, APP_ROUTES, ChevronDownIcon } from '../constants';
import FavoriteButton from '../components/FavoriteButton'; 

const ToolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  const fetchTool = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const toolData = await getToolById(id);
      if (toolData) {
        setTool(toolData);
      } else {
        setError('Tool not found.');
      }
    } catch (err) {
      console.error("Failed to fetch tool:", err);
      setError('Failed to load tool details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTool();
  }, [fetchTool]);

  const handleUpvote = async () => {
    if (!tool) return;
    try {
      const updatedTool = await upvoteTool(tool.id);
      if (updatedTool) {
        setTool(prevTool => prevTool ? { ...prevTool, upvotes: updatedTool.upvotes } : null);
      }
    // Fix: Added braces to the catch block for proper syntax and scoping.
    } catch (err) { 
      console.error("Failed to upvote tool:", err);
    }
  };

  const handleAddComment = async (itemId: string, text: string, user: User): Promise<CommentType | undefined> => {
    if (!tool) return undefined;
    const newCommentData = {
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        text,
        upvotes: 0,
    };
    const addedComment = await addCommentToTool(itemId, newCommentData);
    if (addedComment) {
        setTool(prevTool => prevTool ? { ...prevTool, comments: [addedComment, ...prevTool.comments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) } : null);
    }
    return addedComment;
  };




  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading tool details..." /></div>;
  if (error) return <div className="text-center text-red-500 text-xl py-10">{error}</div>;
  if (!tool) return <div className="text-center text-slate-500 text-xl py-10">Tool data is unavailable.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10 animate-fadeInPage border border-[#E5E7EB]">
      {currentUser?.isAdmin && (
        <div className="mb-6 flex justify-end">
          <Link
            to={`/admin/edit-tool/${tool.id}`}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors text-sm shadow-sm"
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            Edit Tool
          </Link>
        </div>
              )}

        <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="md:w-1/3 flex-shrink-0">
            <img 
                src={tool.logoUrl || PLACEHOLDER_IMAGE_URL(300,300,tool.name)} 
                alt={`${tool.name} logo`} 
                className="w-full h-auto max-h-72 object-contain rounded-lg shadow-md border border-[#E5E7EB]"
            />
            </div>
            <div className="md:w-2/3">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">{tool.name}</h1>
                <FavoriteButton toolId={tool.id} className="text-xl" />
            </div>
            <p className="text-[#475569] mb-6 text-base leading-relaxed">{tool.shortDescription}</p>
            <div className="flex flex-wrap gap-3 items-center mb-6">
                <button
                  onClick={handleUpvote}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-purple-50 text-[#475569] hover:text-[#6C4DFF] rounded-md transition-colors font-medium shadow-sm border border-slate-300 hover:border-[#6C4DFF]"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                  <span>Upvote ({tool.upvotes})</span>
                </button>
                <a 
                  href={tool.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#6C4DFF] hover:bg-purple-700 text-white font-semibold rounded-md transition-colors shadow-sm hover:shadow-md"
                >
                  Visit Website
                </a>
            </div>
            {tool.tags && tool.tags.length > 0 && (
                <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Tags</h4>
                <div className="flex flex-wrap gap-2">
                    {tool.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded-full font-medium">{tag}</span>
                    ))}
                </div>
                </div>
            )}
            </div>
        </div>

        <div className="prose prose-slate max-w-none text-[#475569] mb-8 leading-relaxed text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: tool.fullDescription.replace(/\n/g, '<br />') }}>
        </div>

        {tool.features && tool.features.length > 0 && (
            <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-4 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-orange-400" /> Key Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 list-none p-0">
                {tool.features.map((feature, index) => (
                <li key={index} className="flex items-start p-3 bg-slate-50 rounded-md border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#0F172A] text-sm">{feature}</span>
                </li>
                ))}
            </ul>
            </div>
        )}

        {tool.screenshots && tool.screenshots.length > 0 && (
            <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Screenshots</h3>
            <ScreenshotCarousel screenshots={tool.screenshots} toolName={tool.name} />
            </div>
        )}

        {tool.publicGuide && (
            <div className="mb-8 p-5 bg-slate-50 rounded-lg border border-slate-200">
            <button 
                onClick={() => setIsGuideVisible(!isGuideVisible)}
                className="flex justify-between items-center w-full text-left text-lg font-semibold text-[#0F172A] hover:text-[#6C4DFF] mb-2"
            >
                <span className="flex items-center"><AcademicCapIcon className="w-5 h-5 mr-2"/> Public Guide</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isGuideVisible ? 'rotate-180' : ''}`} />
            </button>
            {isGuideVisible && (
                <div className="prose prose-slate max-w-none text-[#475569] mt-2 animate-fadeIn text-sm" dangerouslySetInnerHTML={{ __html: tool.publicGuide.replace(/\n/g, '<br />') }}>
                </div>
            )}
            </div>
        )}

      <CommentSection
        itemId={tool.id}
        commentsData={tool.comments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
        onAddComment={handleAddComment}
        // onUpvoteComment={handleUpvoteComment} // Implement if needed
        isLoading={isLoading} 
      />
      <style>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInPage { animation: fadeInPage 0.5s ease-out forwards; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

        /* Adapting prose for light theme */
        .prose-slate h1, .prose-slate h2, .prose-slate h3, .prose-slate h4, .prose-slate strong { color: #0F172A; }
        .prose-slate a { color: #6C4DFF; }
        .prose-slate blockquote { border-left-color: #CBD5E1; color: #334152;}
        .prose-slate code { color: #0F172A; background-color: #F1F5F9; padding: 0.2em 0.4em; border-radius: 0.25rem;}

      `}</style>
    </div>
  );
};

export default ToolDetailPage;
