
import React from 'react';
import { ToolCategory } from '../types';

interface CategoryPillProps {
  category: ToolCategory;
  onClick?: (categoryId: string) => void;
  isActive?: boolean;
  isAllTools?: boolean; // Special prop for "All Tools" styling
}

const CategoryPill: React.FC<CategoryPillProps> = ({ category, onClick, isActive, isAllTools }) => {
  const baseClasses = "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer flex items-center space-x-1.5 sm:space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap";
  
  let activeClasses = "bg-[#6C4DFF] text-white focus:ring-[#6C4DFF]";
  // For "All Tools", match the screenshot's "All Tools" styling (often primary accent text, light bg)
  // but current screenshot shows it active with solid purple like others.
  // Keeping it consistent with other active pills.

  const inactiveClasses = "bg-[#F1F5F9] hover:bg-slate-200 text-[#475569] hover:text-[#0F172A] focus:ring-slate-400";

  return (
    <button
      onClick={() => onClick && onClick(category.id)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-pressed={isActive}
      title={category.description}
    >
      {typeof category.icon === 'string' && <span className="text-sm sm:text-base" role="img" aria-label={`${category.name} icon`}>{category.icon}</span>}
      {/* For ReactNode icons, if ever used:
      {React.isValidElement(category.icon) && <span className="w-4 h-4">{category.icon}</span>}
      */}
      <span>{category.name}</span>
    </button>
  );
};

export default CategoryPill;