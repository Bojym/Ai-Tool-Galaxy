
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ToolCard from '../components/ToolCard';
import CategoryPill from '../components/CategoryPill';
import LoadingSpinner from '../components/LoadingSpinner';
import { Tool, ToolCategory, AISearchSuggestion } from '../types';
import { getTools, getCategories, getTrendingTools } from '../services/toolService';
import { APP_ROUTES, SparklesIcon, PLACEHOLDER_IMAGE_URL } from '../constants';

// Minimal card for real-time search results
const RealtimeSearchItem: React.FC<{ tool: Tool }> = ({ tool }) => (
  <Link 
    to={APP_ROUTES.HOME + `tool/${tool.id}`} 
    className="block p-3 hover:bg-slate-100 rounded-md transition-colors duration-150"
  >
    <div className="flex items-center space-x-3">
      <img 
        src={tool.logoUrl || PLACEHOLDER_IMAGE_URL(40,40,tool.name)} 
        alt={`${tool.name} logo`} 
        className="w-8 h-8 object-contain rounded"
      />
      <div>
        <h4 className="text-sm font-semibold text-[#0F172A]">{tool.name}</h4>
        <p className="text-xs text-[#475569] line-clamp-1">{tool.shortDescription}</p>
      </div>
    </div>
  </Link>
);


const HomePage: React.FC = () => {
  const [allTools, setAllTools] = useState<Tool[]>([]); // Stores all tools fetched once
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [trendingTools, setTrendingTools] = useState<Tool[]>([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  // For SearchBar input and real-time results displayed above categories
  const [searchBarQuery, setSearchBarQuery] = useState(''); // Query currently in the search bar
  const [realtimeSearchResults, setRealtimeSearchResults] = useState<Tool[]>([]);
  const [isLoadingRealtimeResults, setIsLoadingRealtimeResults] = useState(false);
  const [realtimeAiSuggestions, setRealtimeAiSuggestions] = useState<AISearchSuggestion | null>(null);

  // For filters applied to the main content area (below categories)
  const [activeSearchQuery, setActiveSearchQuery] = useState(''); // Query submitted via Enter/Search button
  const [activeAiSuggestions, setActiveAiSuggestions] = useState<AISearchSuggestion | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all"); // Default to "All Tools"
  
  const [mainDisplayTools, setMainDisplayTools] = useState<Tool[]>([]);
  const [isLoadingMainDisplayTools, setIsLoadingMainDisplayTools] = useState(false);

  const fetchAllToolsOnce = useCallback(async () => {
     try {
        const toolsData = await getTools(); // Fetch all tools without specific filters initially
        setAllTools(toolsData);
     } catch (error) {
        console.error("Failed to load all tools:", error);
     }
  }, []);
  
  const fetchInitialStaticData = useCallback(async () => {
    setIsLoadingInitialData(true);
    try {
      const [categoriesData, trendingData] = await Promise.all([
        getCategories(),
        getTrendingTools(4),
      ]);
      const allToolsCategory: ToolCategory = { id: 'all', name: 'All Tools', description: 'Browse all available tools.', icon: '🌍' };
      setCategories([allToolsCategory, ...categoriesData]);
      setTrendingTools(trendingData);
    } catch (error) {
      console.error("Failed to load initial static data:", error);
    } finally {
      setIsLoadingInitialData(false);
    }
  }, []);

  useEffect(() => {
    fetchAllToolsOnce();
    fetchInitialStaticData();
  }, [fetchAllToolsOnce, fetchInitialStaticData]);

  // Handles real-time query changes from SearchBar
  const handleQueryChange = useCallback(async (query: string, suggestions: AISearchSuggestion | null) => {
    setSearchBarQuery(query); // Keep SearchBar input in sync
    setRealtimeAiSuggestions(suggestions);

    if (!query.trim()) {
      setRealtimeSearchResults([]);
      setIsLoadingRealtimeResults(false);
      return;
    }

    setIsLoadingRealtimeResults(true);
    try {
      // Use AI suggestions if available for more targeted real-time results
      let searchTerms = query;
      let categoryToSearch: string | undefined;
      
      if (suggestions?.keywords?.length) {
        searchTerms = suggestions.keywords.join(' ');
      }
      
      if (suggestions?.categories?.length) {
        const categoryObj = categories.find(c => c.name === suggestions.categories[0]);
        categoryToSearch = categoryObj?.id;
      }

      // Filter tools manually since our getTools function needs updating
      let filteredTools = allTools;
      
      // Apply search terms
      if (searchTerms) {
        const searchWords = searchTerms.toLowerCase().split(' ').filter(Boolean);
        filteredTools = filteredTools.filter(tool => {
          const nameMatch = searchWords.some(word => tool.name.toLowerCase().includes(word));
          const descMatch = searchWords.some(word => tool.shortDescription.toLowerCase().includes(word));
          const tagMatch = tool.tags.some(tag => 
            searchWords.some(word => tag.toLowerCase().includes(word))
          );
          return nameMatch || descMatch || tagMatch;
        });
      }
      
      // Apply category filter if AI suggested one
      if (categoryToSearch) {
        filteredTools = filteredTools.filter(tool => 
          tool.categories.includes(categoryToSearch!)
        );
      }
      
      // Sort by upvotes and limit to 5
      const tools = filteredTools
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 5);
      setRealtimeSearchResults(tools);
    } catch (error) {
      console.error("Failed to fetch real-time search results:", error);
      setRealtimeSearchResults([]);
    } finally {
      setIsLoadingRealtimeResults(false);
    }
  }, [categories, allTools]);

  // Handles explicit search submission from SearchBar
  const handleSearchSubmit = useCallback((query: string, suggestions: AISearchSuggestion | null) => {
    setActiveSearchQuery(query);
    setActiveAiSuggestions(suggestions);
    setSelectedCategoryId("all"); // Reset category filter when a search is submitted
    setSearchBarQuery(query); // Keep submitted query in search bar
    setRealtimeSearchResults([]); // Clear real-time results as main display will take over
    setIsLoadingRealtimeResults(false);
  }, []);
  
  // Handles category pill clicks
  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setActiveSearchQuery(''); // Clear submitted search query
    setActiveAiSuggestions(null);
    setSearchBarQuery(''); // Clear search bar input
    setRealtimeSearchResults([]);
    setIsLoadingRealtimeResults(false);
  }, []);

  // Effect to filter and set tools for the main display area
  useEffect(() => {
    const filterMainDisplayTools = async () => {
      if (!allTools.length) return; // Wait for allTools to be loaded

      setIsLoadingMainDisplayTools(true);
      // Corrected variable declaration
      let toolsToDisplay = [...allTools];

      if (activeSearchQuery) {
        // Filter by submitted search query / AI suggestions
        const searchWords = (activeAiSuggestions?.keywords?.length ? activeAiSuggestions.keywords : activeSearchQuery.toLowerCase().split(" ")).filter(Boolean);
        const searchCategories = activeAiSuggestions?.categories?.map(catName => categories.find(c => c.name === catName)?.id).filter((id): id is string => !!id) || [];

        toolsToDisplay = allTools.filter(tool => {
          const nameMatch = searchWords.some(word => tool.name.toLowerCase().includes(word));
          const descMatch = searchWords.some(word => tool.shortDescription.toLowerCase().includes(word));
          const tagMatch = tool.tags.some(tag => searchWords.some(word => tag.toLowerCase().includes(word)));
          // Fix: Check if any of the tool's categories are included in the searchCategories
          const categoryMatch = searchCategories.length > 0 ? tool.categories.some(tc => searchCategories.includes(tc)) : true;
          return (nameMatch || descMatch || tagMatch) && categoryMatch;
        });

      } else if (selectedCategoryId && selectedCategoryId !== 'all') {
        // Filter by selected category
        // Fix: Check if the tool's categories array includes the selectedCategoryId
        toolsToDisplay = allTools.filter(tool => tool.categories.includes(selectedCategoryId));
      } else {
        // No active search submission, "All Tools" selected or no specific category
        // In this case, we don't show a list of "all tools" in the main display by default.
        // The "Trending Tools" section will be shown instead if conditions met.
        // Or, if "All Tools" category is clicked, we could show all tools here.
        // For now, let's make "All Tools" click also show all tools in main display.
        if (selectedCategoryId === 'all' && !activeSearchQuery) {
            // toolsToDisplay will remain allTools, but typically we show trending instead
            // If "All Tools" is clicked, perhaps it should clear activeSearchQuery and show everything or trending.
            // Let's make it so if "All Tools" is active and no search, mainDisplayTools is empty, so Trending shows.
            // To actually show ALL tools if "All Tools" category is clicked:
            // toolsToDisplay = (selectedCategoryId === 'all' && !activeSearchQuery) ? [...allTools] : toolsToDisplay;
             toolsToDisplay = []; // This ensures trending tools are shown if 'all' is selected and no search.
        }
      }
      
      // Sort results (example: by upvotes)
      toolsToDisplay.sort((a, b) => b.upvotes - a.upvotes);
      setMainDisplayTools(toolsToDisplay);
      setIsLoadingMainDisplayTools(false);
    };

    filterMainDisplayTools();
  }, [activeSearchQuery, activeAiSuggestions, selectedCategoryId, allTools, categories]);


  const showTrendingTools = !activeSearchQuery && (!selectedCategoryId || selectedCategoryId === 'all');
  const showMainDisplayGrid = (activeSearchQuery || (selectedCategoryId && selectedCategoryId !== 'all')) && !isLoadingMainDisplayTools;


  return (
    <div className="animate-fadeInPage">
      <header className="text-center py-10 md:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] mb-3">
            Discover the Best AI Tools for Any Task
        </h1>
        <p className="text-base sm:text-lg text-[#475569] max-w-xl mx-auto mb-8">
          Your curated catalog of AI-powered solutions. Describe what you want to do, and we'll find the tools.
        </p>
        <SearchBar 
          initialQuery={searchBarQuery}
          onQueryChange={handleQueryChange} 
          onSearchSubmit={handleSearchSubmit}
          availableCategories={categories}
        />
      </header>

      {/* Real-time search results section */}
      {searchBarQuery.trim() && (
        <section className="mb-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg border border-[#E5E7EB] p-2 -mt-4">
          {realtimeAiSuggestions && (
            <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-100">
              <div className="flex items-center text-xs text-[#6C4DFF] font-medium mb-1">
                <SparklesIcon className="w-3 h-3 mr-1" />
                AI Enhanced Search
              </div>
              {realtimeAiSuggestions.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {realtimeAiSuggestions.categories.map(cat => (
                    <span key={cat} className="px-1.5 py-0.5 bg-[#6C4DFF] text-white text-xs rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              {realtimeAiSuggestions.keywords.length > 0 && (
                <div className="text-xs text-slate-600">
                  Keywords: {realtimeAiSuggestions.keywords.join(', ')}
                </div>
              )}
            </div>
          )}
          {isLoadingRealtimeResults ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" text="AI is searching..." />
            </div>
          ) : realtimeSearchResults.length > 0 ? (
            <div className="max-h-72 overflow-y-auto custom-scrollbar-light divide-y divide-slate-100">
              {realtimeSearchResults.map(tool => <RealtimeSearchItem key={tool.id} tool={tool} />)}
            </div>
          ) : (
            <p className="text-[#475569] text-sm text-center p-4">No instant results found for "{searchBarQuery}". Try submitting the search.</p>
          )}
        </section>
      )}

      {categories.length > 0 && (
        <section className="mb-10 md:mb-12">
          <div className="flex flex-wrap gap-x-2 gap-y-2 sm:gap-x-3 items-center justify-start sm:justify-center">
            {categories.map(cat => (
              <CategoryPill 
                key={cat.id} 
                category={cat} 
                onClick={handleCategoryClick}
                isActive={selectedCategoryId === cat.id}
                isAllTools={cat.id === 'all'}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Main content area: either submitted search results, category results, or trending tools */}
      {isLoadingInitialData || isLoadingMainDisplayTools && !showTrendingTools ? (
        <LoadingSpinner text="Loading tools..."/>
      ) : showMainDisplayGrid && mainDisplayTools.length > 0 ? (
         <section className="mb-12">
           <h2 className="text-2xl font-semibold text-[#0F172A] mb-6">
             {activeSearchQuery ? `Results for "${activeSearchQuery}"` : (selectedCategoryId !== 'all' ? `${categories.find(c => c.id === selectedCategoryId)?.name || 'Selected'} Tools` : 'Tools')}
           </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {mainDisplayTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
         </section>
      ) : showMainDisplayGrid && mainDisplayTools.length === 0 ? (
          <p className="text-[#475569] text-center py-8 text-base">
            No tools found for your current filter. Try a different search or category.
          </p>
      ) : showTrendingTools && trendingTools.length > 0 ? (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] flex items-center">
              <img alt="Trending icon" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF4500'%3E%3Cpath d='M17.25 9.61C17.25 8.45 16.77 7.33 16 6.55L12.71 2.13C12.32 1.74 11.69 1.74 11.3 2.13L8 6.55C7.23 7.33 6.75 8.45 6.75 9.61C6.75 12.5 10.03 15.54 11.65 17.16C11.85 17.35 12.16 17.35 12.36 17.16C13.97 15.54 17.25 12.5 17.25 9.61ZM12 12.75C10.62 12.75 9.5 11.63 9.5 10.25C9.5 8.87 10.62 7.75 12 7.75C13.38 7.75 14.5 8.87 14.5 10.25C14.5 11.63 13.38 12.75 12 12.75Z'/%3E%3C/svg%3E" className="w-6 h-6 mr-2" />
              Trending Tools
            </h2>
            <Link to={APP_ROUTES.EXPLORE} className="text-sm text-[#6C4DFF] hover:text-purple-700 font-medium">
              View all &rarr;
            </Link>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {trendingTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
        </section>
      ) : (
         <p className="text-[#475569] text-center py-8 text-base">No tools to display at the moment.</p>
      )}
      
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

export default HomePage;
