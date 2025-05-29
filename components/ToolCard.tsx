
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tool, ToolCategory } from '../types'; // Assuming ToolCategory might be needed for category name
import { APP_ROUTES, PLACEHOLDER_IMAGE_URL, HeartIcon, ChatBubbleLeftEllipsisIcon } from '../constants'; // Removed UpvoteButton import
import FavoriteButton from './FavoriteButton';
import Modal from './Modal';
import ScreenshotCarousel from './ScreenshotCarousel';
import { MOCK_CATEGORIES } from '../services/toolService'; // To get category name from ID

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryName = (categoryId: string): string => {
    const category = MOCK_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Display the first category, or "Uncategorized" if none
  const displayCategoryName = tool.categories && tool.categories.length > 0 
    ? getCategoryName(tool.categories[0]) 
    : "Uncategorized";


  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl border border-[#E5E7EB]">
        <Link to={APP_ROUTES.HOME + `tool/${tool.id}`} className="block relative">
          <img 
            src={tool.logoUrl || PLACEHOLDER_IMAGE_URL(100,100,tool.name)} 
            alt={`${tool.name} logo`} 
            className="w-16 h-16 object-contain m-4 rounded-md border border-[#E5E7EB]" 
          />
           <div className="absolute top-4 right-4">
             <FavoriteButton toolId={tool.id} />
           </div>
        </Link>
        <div className="p-4 flex flex-col flex-grow">
          <Link to={APP_ROUTES.HOME + `tool/${tool.id}`} className="block mb-1">
            <h3 className="text-base font-semibold text-[#0F172A] hover:text-[#6C4DFF] transition-colors truncate">
              {tool.name}
            </h3>
          </Link>
          
          <p className="text-[#475569] text-xs mb-3 flex-grow min-h-[48px] line-clamp-3">
            {tool.shortDescription}
          </p>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="text-xs bg-[#E2E8F0] text-[#475569] px-2 py-0.5 rounded-full">
                {displayCategoryName}
            </span>
            {tool.tags?.slice(0, 2).map(tag => ( 
              <span key={tag} className="text-xs bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            {tool.tags && tool.tags.length > 2 && (
                 <span className="text-xs bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full">
                    +{tool.tags.length - 2}
                </span>
            )}
          </div>
          
          <div className="mt-auto flex justify-between items-center pt-3 border-t border-[#E5E7EB]">
            <div className="flex items-center space-x-3 text-xs text-[#475569]">
              {(tool.fullDescription.length > 150 || tool.features?.length > 0 || tool.screenshots?.length > 0) && ( 
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="hover:text-[#6C4DFF]"
                  >
                    Show More
                  </button>
              )}
              <span className="flex items-center">
                <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 mr-0.5"/> {tool.comments?.length || 0}
              </span>
            </div>
            <Link 
                to={APP_ROUTES.HOME + `tool/${tool.id}`} 
                className="text-xs text-white bg-[#6C4DFF] hover:bg-purple-700 font-medium px-3 py-1.5 rounded-md transition-colors"
            >
                View Details
            </Link>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={tool.name} size="lg">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1 custom-scrollbar-light">
          <img src={tool.logoUrl || PLACEHOLDER_IMAGE_URL(100,100,tool.name)} alt={`${tool.name} logo`} className="w-20 h-20 object-contain rounded-lg mx-auto mb-3 border border-[#E5E7EB]" />
          <h3 className="text-xl font-semibold text-[#0F172A] text-center">{tool.name}</h3>
          
          <p className="text-[#475569] leading-relaxed">{tool.fullDescription}</p>

          {tool.screenshots && tool.screenshots.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-[#0F172A] mb-2 mt-4">Screenshots</h4>
              <ScreenshotCarousel screenshots={tool.screenshots} toolName={tool.name} />
            </div>
          )}

          {tool.features && tool.features.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-[#0F172A] mb-2 mt-4">Key Features</h4>
              <ul className="list-disc list-inside text-[#475569] space-y-1 pl-2 text-sm">
                {tool.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
           {tool.useCases && tool.useCases.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-[#0F172A] mb-2 mt-4">Use Cases</h4>
              <ul className="list-disc list-inside text-[#475569] space-y-1 pl-2 text-sm">
                {tool.useCases.map((useCase, index) => (
                  <li key={index}>{useCase}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-3">
             <a 
                href={tool.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#6C4DFF] hover:bg-purple-700 text-white text-sm rounded-md font-medium transition-colors"
            >
                Visit Website
            </a>
            <Link 
                to={APP_ROUTES.HOME + `tool/${tool.id}`} 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-sm rounded-md font-medium transition-colors border border-[#E5E7EB]"
            >
                View Full Page
            </Link>
          </div>
        </div>
         <style>{`
          .custom-scrollbar-light::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar-light::-webkit-scrollbar-track {
            background: #F1F5F9; /* light gray */
            border-radius: 10px;
          }
          .custom-scrollbar-light::-webkit-scrollbar-thumb {
            background: #CBD5E1; /* slate-300 */
            border-radius: 10px;
          }
          .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
            background: #94A3B8; /* slate-400 */
          }
        `}</style>
      </Modal>
    </>
  );
};

export default ToolCard;