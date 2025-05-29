import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Tool } from '../types';
import { getTools, updateToolDetails, deleteTool } from '../services/toolService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ClipboardDocumentCheckIcon, CheckIcon, XMarkIcon, EyeIcon, ShieldCheckIcon } from '../constants';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../constants';

const AdminReviewPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    setIsLoading(true);
    try {
      const allTools = await getTools();
      // Filter for pending submissions (we'll need to add a status field to tools)
      // For now, let's simulate pending submissions by filtering recent tools
      const pending = allTools.filter(tool => 
        // This is a temporary filter - in real implementation, you'd have a 'status' field
        tool.fullDescription === 'Pending Review' || 
        tool.shortDescription.includes('[PENDING]') ||
        tool.submittedBy !== 'admin1' // assuming non-admin submissions are pending
      );
      setPendingSubmissions(pending);
    } catch (error) {
      console.error('Failed to fetch pending submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (toolId: string) => {
    setProcessingIds(prev => new Set([...prev, toolId]));
    try {
      // Update tool to approved status
      const tool = pendingSubmissions.find(t => t.id === toolId);
      if (tool) {
        await updateToolDetails(toolId, {
          shortDescription: tool.shortDescription.replace('[PENDING]', ''),
          fullDescription: tool.fullDescription === 'Pending Review' ? 'Approved AI tool for your workflow.' : tool.fullDescription
        });
        
        // Remove from pending list
        setPendingSubmissions(prev => prev.filter(t => t.id !== toolId));
      }
    } catch (error) {
      console.error('Failed to approve submission:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        return newSet;
      });
    }
  };

  const handleReject = async (toolId: string) => {
    if (!confirm('Are you sure you want to reject this submission? This will permanently delete it.')) {
      return;
    }

    setProcessingIds(prev => new Set([...prev, toolId]));
    try {
      await deleteTool(toolId);
      setPendingSubmissions(prev => prev.filter(t => t.id !== toolId));
    } catch (error) {
      console.error('Failed to reject submission:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        return newSet;
      });
    }
  };

  // Redirect if not admin
  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Access Denied</h1>
          <p className="text-[#475569]">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeInPage">
      <header className="text-center py-8 md:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2 flex items-center justify-center">
          <ClipboardDocumentCheckIcon className="w-8 h-8 mr-3 text-[#6C4DFF]" />
          Review Submissions
        </h1>
        <p className="text-base text-[#475569] max-w-lg mx-auto">
          Review and approve tool submissions from users.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <LoadingSpinner size="lg" text="Loading submissions..." />
        </div>
      ) : pendingSubmissions.length > 0 ? (
        <div className="space-y-6">
          {pendingSubmissions.map(tool => (
            <div key={tool.id} className="bg-white rounded-lg shadow-md border border-[#E5E7EB] p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <img 
                      src={tool.logoUrl || `https://picsum.photos/seed/${tool.name}/40/40`} 
                      alt={`${tool.name} logo`} 
                      className="w-10 h-10 object-contain rounded mr-3"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-[#0F172A]">{tool.name}</h3>
                      <p className="text-sm text-[#6C4DFF] font-medium">
                        {tool.categories.join(', ')} • {tool.pricing}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[#475569] mb-3">{tool.shortDescription}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tool.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-[#475569] space-y-1">
                    <p><strong>Website:</strong> <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#6C4DFF] hover:underline">{tool.websiteUrl}</a></p>
                    <p><strong>Source:</strong> {tool.source}</p>
                    {tool.submittedBy && <p><strong>Submitted by:</strong> {tool.submittedBy}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <Link
                    to={`/tool/${tool.id}`}
                    className="flex items-center px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-[#475569] rounded-md transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Link>
                  
                  <button
                    onClick={() => handleApprove(tool.id)}
                    disabled={processingIds.has(tool.id)}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {processingIds.has(tool.id) ? 'Approving...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleReject(tool.id)}
                    disabled={processingIds.has(tool.id)}
                    className="flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    {processingIds.has(tool.id) ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow border border-[#E5E7EB]">
          <ClipboardDocumentCheckIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#0F172A] mb-2">No Pending Submissions</h3>
          <p className="text-[#475569] text-sm">
            All tool submissions have been reviewed. Great job!
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInPage { animation: fadeInPage 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminReviewPage; 