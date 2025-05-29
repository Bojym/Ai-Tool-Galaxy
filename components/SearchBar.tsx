import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AISearchSuggestion, ToolCategory } from '../types';
import { analyzeSearchQueryWithAI } from '../services/aiSearchService';

interface SearchBarProps {
  onQueryChange: (query: string, suggestions: AISearchSuggestion | null) => void; // For real-time updates
  onSearchSubmit: (query: string, suggestions: AISearchSuggestion | null) => void; // For explicit submission
  initialQuery?: string;
  availableCategories?: ToolCategory[]; // For AI suggestions
}

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

const SearchBar: React.FC<SearchBarProps> = ({ onQueryChange, onSearchSubmit, initialQuery = '', availableCategories = [] }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const latestSuggestionsRef = useRef<AISearchSuggestion | null>(null);

  // Debounced AI analysis
  const debouncedAIAnalysis = useCallback(
    debounce(async (currentQuery: string) => {
      if (!currentQuery.trim() || availableCategories.length === 0) {
        latestSuggestionsRef.current = null;
        onQueryChange(currentQuery, null);
        setIsLoadingAI(false);
        return;
      }
      
      setIsLoadingAI(true);
      try {
        const suggestions = await analyzeSearchQueryWithAI(currentQuery, availableCategories);
        latestSuggestionsRef.current = suggestions;
        onQueryChange(currentQuery, suggestions);
      } catch (error) {
        console.error('AI search analysis failed:', error);
        latestSuggestionsRef.current = null;
        onQueryChange(currentQuery, null);
      } finally {
        setIsLoadingAI(false);
      }
    }, 600), // 600ms debounce for AI calls
    [onQueryChange, availableCategories]
  );

  useEffect(() => {
    debouncedAIAnalysis(query);
  }, [query, debouncedAIAnalysis]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass current query and latest AI suggestions
    onSearchSubmit(query, latestSuggestionsRef.current); 
  };
  
  const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoadingAI ? (
            <div className="w-5 h-5 border-2 border-slate-300 border-t-[#6C4DFF] rounded-full animate-spin"></div>
          ) : (
            <SearchIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={handleInputChange}
          placeholder="Describe what you want to do, and AI will find the right tools..."
          className="w-full pl-12 pr-28 py-3 text-base bg-white border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-[#6C4DFF] focus:border-[#6C4DFF] outline-none placeholder-slate-400 text-[#0F172A] shadow-sm"
          aria-label="Search for AI tools"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-5 my-1.5 mr-1.5 bg-[#6C4DFF] hover:bg-purple-700 text-white text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow-sm hover:shadow-md"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;