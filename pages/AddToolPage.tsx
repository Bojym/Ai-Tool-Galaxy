
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminAddTool, getCategories, PRICING_OPTIONS, SOURCE_OPTIONS } from '../services/toolService';
import { AIGeneratedToolDetails, ToolCategory, PricingTier, SourceType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { APP_ROUTES, SparklesIcon, ArrowLeftIcon, PlusIcon, XMarkIcon } from '../constants';
import { extractProductDataFromUrl, findWebsiteLogo } from '../services/productionExtractionService';

const AddToolPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [generatedDetails, setGeneratedDetails] = useState<AIGeneratedToolDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<ToolCategory[]>([]);
  
  const [manualLogoUrl, setManualLogoUrl] = useState('');
  
  // AI extraction state
  const [isExtracting, setIsExtracting] = useState(false);


  useEffect(() => {
    if (!currentUser?.isAdmin) {
      navigate(APP_ROUTES.HOME); 
    }
    const fetchCats = async () => {
        const cats = await getCategories();
        setAllCategories(cats);
    };
    fetchCats();
  }, [currentUser, navigate]);

    const handleGenerateDetails = async () => {
    if (!websiteUrl.trim()) {
      setError("Please enter the Tool Website URL.");
      return;
    }
    
    setIsExtracting(true);
    setError(null);
    setGeneratedDetails(null);
    try {
      const extracted = await extractProductDataFromUrl(websiteUrl);
      
      // Convert extracted data to AIGeneratedToolDetails format
      const initialFeatures = extracted.features && extracted.features.length > 0 ? extracted.features : [''];
      const initialUseCases = extracted.useCases && extracted.useCases.length > 0 ? extracted.useCases : [''];
      const initialTags = extracted.tags && extracted.tags.length > 0 ? extracted.tags : [''];
      
      const aiDetails: AIGeneratedToolDetails = {
        name: extracted.name,
        shortDescription: extracted.description,
        fullDescription: extracted.description,
        logoUrl: extracted.logoUrl || '',
        features: initialFeatures,
        useCases: initialUseCases,
        tags: initialTags,
        pricing: extracted.pricing as PricingTier,
        source: 'Closed Source' as SourceType,
        categories: allCategories.length > 0 ? [allCategories[0].id] : []
      };
      
      setGeneratedDetails(aiDetails);
      setManualLogoUrl(extracted.logoUrl || '');
    } catch (err: any) {
      console.error('Failed to extract tool details:', err);
      
      // Enhanced error handling with specific guidance
      let errorMessage = `AI extraction failed: ${err.message}`;
      let isJavaScriptError = false;
      
      if (err.message.includes('JavaScript') || err.message.includes('SPA') || err.message.includes('ScrapingBee')) {
        isJavaScriptError = true;
        errorMessage = `⚡ JavaScript-heavy website detected. ${err.message}`;
      }
      
      setError(errorMessage + " Don't worry - you can manually enter the details below.");
      
      // Extract domain name from URL for basic name suggestion
      let suggestedName = '';
      try {
        const url = new URL(websiteUrl);
        suggestedName = url.hostname.replace('www.', '').split('.')[0];
        suggestedName = suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1);
      } catch {
        suggestedName = '';
      }
      
      setGeneratedDetails({
            name: suggestedName, 
            shortDescription: '', 
            fullDescription: '',
            features: [''], 
            useCases: [''], 
            tags: [''],
            categories: allCategories.length > 0 ? [allCategories[0].id] : [],
            pricing: 'Freemium', 
            source: 'Closed Source', 
            logoUrl: ''
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDetailChange = <K extends keyof AIGeneratedToolDetails,>(field: K, value: AIGeneratedToolDetails[K]) => {
    setGeneratedDetails(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleDynamicListItemChange = (
    fieldName: 'features' | 'tags' | 'useCases',
    index: number,
    value: string
  ) => {
    setGeneratedDetails(prev => {
      if (!prev) return null;
      const list = prev[fieldName] ? [...prev[fieldName]!] : [];
      list[index] = value;
      return { ...prev, [fieldName]: list };
    });
  };

  const addDynamicListItem = (fieldName: 'features' | 'tags' | 'useCases') => {
    setGeneratedDetails(prev => {
      if (!prev) return null;
      const list = prev[fieldName] ? [...prev[fieldName]!] : [];
      return { ...prev, [fieldName]: [...list, ''] };
    });
  };

  const removeDynamicListItem = (
    fieldName: 'features' | 'tags' | 'useCases',
    index: number
  ) => {
    setGeneratedDetails(prev => {
      if (!prev) return null;
      const list = prev[fieldName] ? [...prev[fieldName]!] : [];
      if (list.length > 1) {
        return { ...prev, [fieldName]: list.filter((_, i) => i !== index) };
      } else {
        return { ...prev, [fieldName]: [''] }; // Keep one empty input
      }
    });
  };


  const handleCategoryCheckboxChange = (categoryId: string) => {
    setGeneratedDetails(prev => {
        if (!prev) return null;
        const currentCategories = prev.categories || [];
        const newCategories = currentCategories.includes(categoryId)
            ? currentCategories.filter(id => id !== categoryId)
            : [...currentCategories, categoryId];
        return { ...prev, categories: newCategories };
    });
  };


  const handleSubmitTool = async () => {
    if (!generatedDetails || !websiteUrl.trim() || !generatedDetails.name?.trim() || !generatedDetails.categories?.length) {
      setError("Please ensure all required fields (Name, Website URL, Categories) are filled after generation.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const finalLogoUrl = manualLogoUrl.trim() || generatedDetails.logoUrl;

      const toolToAdd: AIGeneratedToolDetails = {
        ...generatedDetails,
        logoUrl: finalLogoUrl,
        features: generatedDetails.features?.map(f => f.trim()).filter(f => f) || [],
        useCases: generatedDetails.useCases?.map(uc => uc.trim()).filter(uc => uc) || [],
        tags: generatedDetails.tags?.map(t => t.trim().toLowerCase()).filter(t => t) || [],
      };

      const newTool = await adminAddTool(toolToAdd, websiteUrl, finalLogoUrl);
      navigate(APP_ROUTES.HOME + `tool/${newTool.id}`);
    } catch (err) {
      console.error("Failed to add tool:", err);
      setError("An error occurred while adding the tool. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#6C4DFF] focus:border-[#6C4DFF] outline-none text-[#0F172A] placeholder-slate-400";
  const labelClass = "block text-sm font-medium text-[#475569] mb-1";


  if (!currentUser?.isAdmin) {
    return <div className="text-center py-10 text-xl text-slate-500">Access Denied. Admin only.</div>;
  }

  const renderDynamicListInputs = (
    fieldName: 'features' | 'tags' | 'useCases',
    placeholderPrefix: string
  ) => (
    <div>
      <label className={labelClass}>{placeholderPrefix}s</label>
      {(generatedDetails?.[fieldName] || ['']).map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleDynamicListItemChange(fieldName, index, e.target.value)}
            className={inputClass}
            placeholder={`${placeholderPrefix} ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => removeDynamicListItem(fieldName, index)}
            className="p-2 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-100 transition-colors"
            aria-label={`Remove ${placeholderPrefix}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addDynamicListItem(fieldName)}
        className="mt-1 text-sm text-[#6C4DFF] hover:text-purple-700 font-medium flex items-center px-3 py-1.5 border border-slate-300 hover:border-purple-400 rounded-md bg-slate-50 hover:bg-purple-50 transition-colors"
      >
        <PlusIcon className="w-4 h-4 mr-1.5" /> Add {placeholderPrefix}
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeInPage">
        <Link to={APP_ROUTES.HOME} className="inline-flex items-center text-sm text-[#6C4DFF] hover:text-purple-700 mb-6 group">
            <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
        </Link>
      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 border border-[#E5E7EB]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2 text-center">
          Admin - Add New Tool
        </h1>
        <p className="text-sm text-[#475569] mb-8 text-center">
          Enter the website URL of the tool. Our multi-method AI extraction can handle most websites, including JavaScript-heavy SPAs.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="websiteUrlInitial" className={`${labelClass} font-semibold`}>Tool Website URL <span className="text-red-600">*</span></label>
            <input 
                type="url" 
                id="websiteUrlInitial" 
                value={websiteUrl} 
                onChange={(e) => setWebsiteUrl(e.target.value)} 
                className={inputClass}
                placeholder="https://exampletool.com" 
            />
          </div>
          
          <div>
            <p className="text-sm text-[#64748B] mb-2">
              🚀 Multi-method extraction: Browser API → Readability API → Direct Fetch. Handles JavaScript websites automatically.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateDetails}
              disabled={isExtracting || !websiteUrl}
              className="flex-1 px-6 py-3 bg-[#6C4DFF] hover:bg-purple-700 text-white font-semibold rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {isExtracting ? (
                <LoadingSpinner size="sm" color="#FFFFFF"/>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" /> 
                  Extract with AI
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                // Extract domain name from URL for basic name suggestion
                let suggestedName = '';
                try {
                  const url = new URL(websiteUrl);
                  suggestedName = url.hostname.replace('www.', '').split('.')[0];
                  suggestedName = suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1);
                } catch {
                  suggestedName = '';
                }
                
                setGeneratedDetails({
                  name: suggestedName,
                  shortDescription: '',
                  fullDescription: '',
                  features: [''],
                  useCases: [''],
                  tags: [''],
                  categories: allCategories.length > 0 ? [allCategories[0].id] : [],
                  pricing: 'Freemium',
                  source: 'Closed Source',
                  logoUrl: ''
                });
                setError(null);
              }}
              disabled={!websiteUrl}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              Skip AI & Enter Manually
            </button>
          </div>
        </div>

        {isExtracting && (
          <div className="my-6">
            <LoadingSpinner text="🚀 Extracting content from website and processing with AI..." />
          </div>
        )}
        
        {error && (
          <div className="my-4">
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300 mb-3">{error}</p>
            
            {/* JavaScript-heavy website guidance */}
            {(error.includes('JavaScript') || error.includes('SPA') || error.includes('ScrapingBee')) && (
              <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-md border border-blue-300 mb-3">
                <p className="font-medium mb-2">🚀 Advanced Options for JavaScript Sites:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li><strong>Pro Solution:</strong> Set up ScrapingBee API key for automatic JS rendering</li>
                  <li><strong>Quick Fix:</strong> Visit the website and manually gather the info</li>
                  <li><strong>What to Look For:</strong> Name, description, features, pricing, logo URL</li>
                  <li><strong>Common Examples:</strong> Deepseek, ChatGPT, Claude, Midjourney, etc.</li>
                </ul>
              </div>
            )}
            
            {/* General extraction tips */}
            <div className="text-sm text-green-600 bg-green-100 p-3 rounded-md border border-green-300">
              <p className="font-medium mb-2">💡 Manual Entry Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-green-700">
                <li>Tool name is auto-suggested from the URL domain</li>
                <li>Right-click on logos and copy image address for Logo URL</li>
                <li>Look for "About", "Features", or "Pricing" sections on their website</li>
                <li>Use browser developer tools (F12) to find hidden logo URLs if needed</li>
              </ul>
            </div>
          </div>
        )}

        {generatedDetails && !isExtracting && (
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-6">Review & Edit Extracted Details</h2>
            <div className="space-y-5">
                <div>
                    <label htmlFor="generatedName" className={labelClass}>Tool Name</label>
                    <input type="text" id="generatedName" value={generatedDetails.name || ''} onChange={(e) => handleDetailChange('name', e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="manualLogoUrl" className={labelClass}>Logo URL</label>
                    <input type="url" id="manualLogoUrl" value={manualLogoUrl} onChange={(e) => setManualLogoUrl(e.target.value)} className={inputClass} placeholder="e.g., https://example.com/logo.png"/>
                </div>
                <div>
                    <label htmlFor="generatedShortDesc" className={labelClass}>Short Description</label>
                    <textarea id="generatedShortDesc" value={generatedDetails.shortDescription || ''} onChange={(e) => handleDetailChange('shortDescription', e.target.value)} rows={3} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="generatedFullDesc" className={labelClass}>Full Description</label>
                    <textarea id="generatedFullDesc" value={generatedDetails.fullDescription || ''} onChange={(e) => handleDetailChange('fullDescription', e.target.value)} rows={5} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Categories</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 border border-slate-300 rounded-md bg-slate-50/50">
                        {allCategories.map(cat => (
                            <label key={cat.id} htmlFor={`admin-cat-${cat.id}`} className="flex items-center space-x-2 text-sm text-[#475569] hover:text-[#6C4DFF] cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id={`admin-cat-${cat.id}`} 
                                    checked={generatedDetails.categories?.includes(cat.id) || false} 
                                    onChange={() => handleCategoryCheckboxChange(cat.id)} 
                                    className="h-4 w-4 rounded border-slate-400 text-[#6C4DFF] focus:ring-[#6C4DFF] focus:ring-offset-1"
                                />
                                <span>{cat.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {renderDynamicListInputs('features', 'Feature')}
                {renderDynamicListInputs('useCases', 'Use Case')}
                {renderDynamicListInputs('tags', 'Tag (lowercase)')}

                 <div>
                    <label htmlFor="generatedPricing" className={labelClass}>Pricing Tier</label>
                    <select id="generatedPricing" value={generatedDetails.pricing || 'Freemium'} onChange={(e) => handleDetailChange('pricing', e.target.value as PricingTier)} className={`${inputClass} appearance-none`}>
                        {PRICING_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="generatedSource" className={labelClass}>Source Type</label>
                    <select id="generatedSource" value={generatedDetails.source || 'Closed Source'} onChange={(e) => handleDetailChange('source', e.target.value as SourceType)} className={`${inputClass} appearance-none`}>
                        {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleSubmitTool}
                    disabled={isSubmitting}
                    className="w-full mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                    {isSubmitting ? <LoadingSpinner size="sm" color="#FFFFFF" /> : 'Add Tool to Catalog'}
                </button>
            </div>
          </div>
        )}
      </div>
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

export default AddToolPage;
