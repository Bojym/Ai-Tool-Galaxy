
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tool, ToolCategory, PricingTier, SourceType } from '../types';
import { getTools, getCategories, PRICING_OPTIONS, SOURCE_OPTIONS } from '../services/toolService';
import ToolCard from '../components/ToolCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SparklesIcon, FilterIcon, TrashIcon } from '../constants';

// Debounce utility
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

interface Filters {
  searchTerm: string;
  categories: string[];
  pricing: PricingTier[];
  sources: SourceType[];
}

const ExplorePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [displayedTools, setDisplayedTools] = useState<Tool[]>([]);
  const [availableCategories, setAvailableCategories] = useState<ToolCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    categories: [],
    pricing: [],
    sources: [],
  });

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [toolsData, categoriesData] = await Promise.all([
        getTools(), // Fetch all tools initially
        getCategories(),
      ]);
      setAllTools(toolsData);
      setDisplayedTools(toolsData); // Initially display all tools
      setAvailableCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load initial explore data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle URL parameter for category filter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && availableCategories.length > 0) {
      // Check if the category exists
      const categoryExists = availableCategories.some(cat => cat.id === categoryParam);
      if (categoryExists) {
        setFilters(prev => ({
          ...prev,
          categories: [categoryParam]
        }));
      }
    }
  }, [searchParams, availableCategories]);

  const applyFilters = useCallback(() => {
    let filtered = [...allTools];

    // Search term filter
    if (filters.searchTerm) {
      const lowerSearchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(lowerSearchTerm) ||
        tool.shortDescription.toLowerCase().includes(lowerSearchTerm) ||
        tool.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      // Fix: Check if any of the tool's categories (tool.categories which is string[]) is present in the filters.categories
      filtered = filtered.filter(tool => tool.categories.some(toolCatId => filters.categories.includes(toolCatId)));
    }

    // Pricing filter
    if (filters.pricing.length > 0) {
      filtered = filtered.filter(tool => filters.pricing.includes(tool.pricing));
    }

    // Source filter
    if (filters.sources.length > 0) {
      filtered = filtered.filter(tool => filters.sources.includes(tool.source));
    }
    
    // Sort results (example: by upvotes)
    filtered.sort((a, b) => b.upvotes - a.upvotes);

    setDisplayedTools(filtered);
  }, [allTools, filters]);
  
  // Debounced version of applyFilters for search term
  const debouncedApplyFilters = useMemo(() => debounce(applyFilters, 300), [applyFilters]);

  useEffect(() => {
    // Apply filters immediately for checkboxes, debounced for search term
     if (filters.searchTerm) {
        debouncedApplyFilters();
     } else {
        applyFilters();
     }
  }, [filters, applyFilters, debouncedApplyFilters]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleCheckboxChange = (filterType: keyof Omit<Filters, 'searchTerm'>, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      categories: [],
      pricing: [],
      sources: [],
    });
    setDisplayedTools([...allTools]); // Reset to all tools
  };

  const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[#0F172A] mb-3 uppercase tracking-wider border-b pb-2 border-slate-200">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const Checkbox: React.FC<{ id: string; label: string; checked: boolean; onChange: () => void }> = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center space-x-2 text-sm text-[#475569] hover:text-[#6C4DFF] cursor-pointer transition-colors">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="h-4 w-4 rounded border-slate-300 text-[#6C4DFF] focus:ring-[#6C4DFF] focus:ring-offset-0" />
      <span>{label}</span>
    </label>
  );
  
  const filterPanelContent = (
      <>
        <div className="p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar-light">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#0F172A] flex items-center"><FilterIcon className="w-5 h-5 mr-2"/> Filters</h2>
                <button onClick={resetFilters} className="text-xs text-[#6C4DFF] hover:text-purple-700 font-medium flex items-center">
                    <TrashIcon className="w-3.5 h-3.5 mr-1"/> Reset All
                </button>
            </div>

            <div className="mb-6">
            <input
                type="search"
                placeholder="Search tools..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:ring-1 focus:ring-[#6C4DFF] focus:border-[#6C4DFF] outline-none placeholder-slate-400 text-[#0F172A]"
            />
            </div>
    
            <FilterSection title="Categories">
            {availableCategories.map(cat => (
                <Checkbox
                key={cat.id}
                id={`cat-${cat.id}`}
                label={cat.name}
                checked={filters.categories.includes(cat.id)}
                onChange={() => handleCheckboxChange('categories', cat.id)}
                />
            ))}
            </FilterSection>
    
            <FilterSection title="Pricing">
            {PRICING_OPTIONS.map(option => (
                <Checkbox
                key={option}
                id={`price-${option}`}
                label={option}
                checked={filters.pricing.includes(option)}
                onChange={() => handleCheckboxChange('pricing', option)}
                />
            ))}
            </FilterSection>
    
            <FilterSection title="Source">
            {SOURCE_OPTIONS.map(option => (
                <Checkbox
                key={option}
                id={`source-${option}`}
                label={option}
                checked={filters.sources.includes(option)}
                onChange={() => handleCheckboxChange('sources', option)}
                />
            ))}
            </FilterSection>
        </div>
      </>
  );


  return (
    <div className="animate-fadeInPage">
      <header className="text-center py-8 md:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2 flex items-center justify-center">
          <SparklesIcon className="w-8 h-8 mr-3 text-[#6C4DFF]" />
          Explore AI Tools
        </h1>
        <p className="text-base text-[#475569] max-w-lg mx-auto">
          Discover and filter through our extensive catalog of AI-powered solutions.
        </p>
      </header>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4 text-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="px-4 py-2 bg-[#6C4DFF] text-white rounded-md text-sm font-medium flex items-center justify-center mx-auto"
        >
          <FilterIcon className="w-5 h-5 mr-2"/> {isSidebarOpen ? 'Close Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Mobile Sidebar */}
      {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <div className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} pt-20`}>
          {filterPanelContent}
      </div>


      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-full md:w-72 lg:w-80 flex-shrink-0 bg-white rounded-lg shadow border border-[#E5E7EB]">
          {filterPanelContent}
        </aside>

        {/* Main content - Tools Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <LoadingSpinner size="lg" text="Loading tools..." />
            </div>
          ) : displayedTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayedTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow border border-[#E5E7EB]">
              <SparklesIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">No Tools Found</h3>
              <p className="text-[#475569] text-sm">
                Try adjusting your filters or{' '}
                <button onClick={resetFilters} className="text-[#6C4DFF] hover:underline font-medium">reset all filters</button>.
              </p>
            </div>
          )}
        </main>
      </div>
       <style>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInPage { animation: fadeInPage 0.5s ease-out forwards; }
        
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: #F1F5F9; 
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: #CBD5E1; 
          border-radius: 10px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
