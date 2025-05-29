
import React, { useState, useEffect, useCallback } from 'react';
import { NewsletterIssue } from '../types';
import { getNewsletterIssues, createNewsletterIssue, sendNewsletterIssue } from '../services/newsletterService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import { NewspaperIcon, PlusCircleIcon } from '../constants';

const NewsletterIssueCard: React.FC<{ issue: NewsletterIssue, onReadMore: (issue: NewsletterIssue) => void }> = ({ issue, onReadMore }) => (
  <div className="bg-slate-800 hover:bg-slate-700/70 p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-purple-500/20 group">
    <h3 className="text-xl font-semibold text-purple-400 group-hover:text-purple-300 transition-colors mb-2">{issue.title}</h3>
    <p className="text-xs text-slate-500 mb-3">Sent: {new Date(issue.sentAt).toLocaleDateString()}</p>
    <p className="text-slate-400 text-sm mb-4 line-clamp-3">{issue.summary || issue.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}</p>
    <button onClick={() => onReadMore(issue)} className="text-purple-400 hover:text-purple-300 font-medium text-sm">Read More &rarr;</button>
  </div>
);


const NewsletterPage: React.FC = () => {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueSummary, setNewIssueSummary] = useState('');
  const [newIssueContent, setNewIssueContent] = useState(''); // HTML content
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedIssue, setSelectedIssue] = useState<NewsletterIssue | null>(null);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedIssues = await getNewsletterIssues();
      setIssues(fetchedIssues);
    } catch (error) {
      console.error("Failed to fetch newsletter issues:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim() || !newIssueContent.trim()) return;
    setIsSubmitting(true);
    try {
      const issueData = { title: newIssueTitle, content: newIssueContent, summary: newIssueSummary };
      const newIssue = await createNewsletterIssue(issueData);
      // Simulate sending
      await sendNewsletterIssue(newIssue.id); 
      setIssues(prev => [newIssue, ...prev]); // Add to top
      setIsCreateModalOpen(false);
      setNewIssueTitle('');
      setNewIssueSummary('');
      setNewIssueContent('');
      alert(`Newsletter "${newIssue.title}" created and "sent"!`);
    } catch (error) {
      console.error("Failed to create newsletter issue:", error);
      // Show error in modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReadMore = (issue: NewsletterIssue) => {
    setSelectedIssue(issue);
    setIsReadModalOpen(true);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-purple-400 flex items-center">
          <NewspaperIcon className="w-10 h-10 mr-3" /> Newsletter Archive
        </h1>
        {currentUser?.isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Create New Issue
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading newsletter issues..." />
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map(issue => (
            <NewsletterIssueCard key={issue.id} issue={issue} onReadMore={handleReadMore}/>
          ))}
        </div>
      ) : (
         <div className="text-center py-10">
            <NewspaperIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No newsletter issues published yet.</p>
        </div>
      )}

      {/* Create Issue Modal (Admin only) */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Newsletter Issue" size="xl">
        <form onSubmit={handleCreateIssue} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 custom-scrollbar">
          <div>
            <label htmlFor="issueTitle" className="block text-sm font-medium text-slate-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="issueTitle" value={newIssueTitle} onChange={(e) => setNewIssueTitle(e.target.value)} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-slate-100" />
          </div>
          <div>
            <label htmlFor="issueSummary" className="block text-sm font-medium text-slate-300 mb-1">Summary (Short teaser for card display)</label>
            <textarea id="issueSummary" value={newIssueSummary} onChange={(e) => setNewIssueSummary(e.target.value)} rows={2} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-slate-100 resize-none" />
          </div>
          <div>
            <label htmlFor="issueContent" className="block text-sm font-medium text-slate-300 mb-1">Content (HTML allowed) <span className="text-red-500">*</span></label>
            <textarea id="issueContent" value={newIssueContent} onChange={(e) => setNewIssueContent(e.target.value)} required rows={10} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-slate-100" placeholder="Write your newsletter content here. You can use HTML tags for formatting."/>
             <p className="text-xs text-slate-400 mt-1">Tip: Use simple HTML like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt; for formatting.</p>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors disabled:opacity-60">
              {isSubmitting ? <LoadingSpinner size="sm"/> : 'Create & Send Issue'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Read Issue Modal */}
       {selectedIssue && (
        <Modal isOpen={isReadModalOpen} onClose={() => setIsReadModalOpen(false)} title={selectedIssue.title} size="xl">
          <div className="max-h-[80vh] overflow-y-auto p-1 custom-scrollbar">
            <p className="text-xs text-slate-400 mb-4">Published: {new Date(selectedIssue.sentAt).toLocaleString()}</p>
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: selectedIssue.content }} />
          </div>
        </Modal>
      )}
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #334155; /* slate-700 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a855f7; /* purple-500 */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9333ea; /* purple-600 */
        }
      `}</style>
    </div>
  );
};

export default NewsletterPage;
    