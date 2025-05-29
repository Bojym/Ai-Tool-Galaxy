
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Tool, ToolCategory, PricingTier } from '../types';
import { submitTool, getCategories, PRICING_OPTIONS } from '../services/toolService';
import LoadingSpinner from '../components/LoadingSpinner';
import { APP_ROUTES, PlusCircleIcon, PlusIcon, XMarkIcon, UploadIcon } from '../constants';

const SubmitToolPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [toolName, setToolName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pricingType, setPricingType] = useState<PricingTier>(PRICING_OPTIONS[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<ToolCategory[]>([]);
  
  const [keyFeatures, setKeyFeatures] = useState<string[]>(['']);
  const [useCases, setUseCases] = useState<string[]>(['']);
  
  const [logoUrl, setLogoUrl] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(['']);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const SHORT_DESC_MAX_LENGTH = 100;

  useEffect(() => {
    if (!currentUser) {
      // Consider navigating to login or showing a more prominent message
      // navigate(APP_ROUTES.LOGIN); 
    }
    const fetchCats = async () => {
        const cats = await getCategories();
        setAllCategories(cats);
    };
    fetchCats();
  }, [currentUser, navigate]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleDynamicListChange = (
    list: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number, 
    value: string
  ) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const addDynamicListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeDynamicListItem = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    if (list.length > 1) { // Keep at least one item
      setter(prev => prev.filter((_, i) => i !== index));
    } else { // Clear the last item if it's the only one
      setter(['']);
    }
  };
  
  const resetForm = useCallback(() => {
    setToolName('');
    setWebsiteUrl('');
    setPricingType(PRICING_OPTIONS[0]);
    setShortDescription('');
    setFullDescription('');
    setSelectedCategoryIds([]);
    setKeyFeatures(['']);
    setUseCases(['']);
    setLogoUrl('');
    setScreenshotUrls(['']);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        setError("You must be logged in to submit a tool.");
        return;
    }
    if (selectedCategoryIds.length === 0) {
        setError("Please select at least one category.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const toolData: Omit<Tool, 'id' | 'upvotes' | 'comments' | 'createdAt' | 'updatedAt'> = {
      name: toolName,
      websiteUrl,
      pricing: pricingType,
      shortDescription,
      fullDescription,
      categories: selectedCategoryIds,
      features: keyFeatures.filter(f => f.trim()),
      useCases: useCases.filter(uc => uc.trim()),
      logoUrl: logoUrl.trim(),
      screenshots: screenshotUrls.map(s => s.trim()).filter(s => s),
      tags: [], // User can submit tags, or admin can add later. For now, keeping it simple.
      source: 'Closed Source', // Default, or add a field for this
      submittedBy: currentUser.id,
    };

    try {
      const newTool = await submitTool(toolData);
      setSuccessMessage(`Tool "${newTool.name}" submitted successfully! It will be reviewed by our team.`);
      resetForm();
      // navigate(APP_ROUTES.HOME + `tool/${newTool.id}`);
    } catch (err) {
      console.error("Tool submission failed:", err);
      setError("Failed to submit tool. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-[#6C4DFF] focus:border-[#6C4DFF] outline-none text-[#0F172A] placeholder-slate-400 text-sm";
  const labelClass = "block text-sm font-medium text-[#475569] mb-1";
  const requiredSpan = <span className="text-red-500 ml-0.5">*</span>;
  
  if (!currentUser) {
    return (
        <div className="text-center py-10 max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-slate-200">
            <PlusCircleIcon className="w-12 h-12 text-[#6C4DFF] mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-[#0F172A] mb-3">Submit a Tool</h1>
            <p className="text-[#475569] text-sm">Please <Link to={APP_ROUTES.HOME} className="text-[#6C4DFF] hover:underline font-medium">sign in</Link> to submit a new AI tool.</p>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 animate-fadeInPage border border-slate-200">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mb-8 text-center">
        Tool Information
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="toolName" className={labelClass}>Tool Name {requiredSpan}</label>
          <input type="text" id="toolName" value={toolName} onChange={(e) => setToolName(e.target.value)} required className={inputClass} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="websiteUrl" className={labelClass}>Website URL {requiredSpan}</label>
                <input type="url" id="websiteUrl" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} required className={inputClass} placeholder="https://example.com" />
            </div>
            <div>
                <label htmlFor="pricingType" className={labelClass}>Pricing Type {requiredSpan}</label>
                <select id="pricingType" value={pricingType} onChange={(e) => setPricingType(e.target.value as PricingTier)} required className={`${inputClass} appearance-none`}>
                    {PRICING_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="shortDescription" className={labelClass}>Short Description (max {SHORT_DESC_MAX_LENGTH} characters)</label>
          <input 
            type="text" 
            id="shortDescription" 
            value={shortDescription} 
            onChange={(e) => setShortDescription(e.target.value)} 
            maxLength={SHORT_DESC_MAX_LENGTH} 
            className={inputClass} 
            placeholder="Brief one-line description"
          />
          <p className="text-xs text-slate-500 mt-1 text-right">{shortDescription.length}/{SHORT_DESC_MAX_LENGTH}</p>
        </div>

        <div>
          <label htmlFor="fullDescription" className={labelClass}>Full Description {requiredSpan}</label>
          <textarea id="fullDescription" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} required rows={4} className={inputClass} placeholder="Explain what this tool does and why it's useful..."/>
        </div>

        <div>
            <label className={labelClass}>Categories {requiredSpan}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 border border-slate-300 rounded-md bg-slate-50/50">
                {allCategories.map(cat => (
                    <label key={cat.id} htmlFor={`cat-${cat.id}`} className="flex items-center space-x-2 text-sm text-[#475569] hover:text-[#6C4DFF] cursor-pointer">
                        <input type="checkbox" id={`cat-${cat.id}`} checked={selectedCategoryIds.includes(cat.id)} onChange={() => handleCategoryChange(cat.id)} className="h-4 w-4 rounded border-slate-400 text-[#6C4DFF] focus:ring-[#6C4DFF] focus:ring-offset-1"/>
                        <span>{cat.name}</span>
                    </label>
                ))}
            </div>
        </div>

        <div>
            <label className={labelClass}>Key Features</label>
            {keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input type="text" value={feature} onChange={(e) => handleDynamicListChange(keyFeatures, setKeyFeatures, index, e.target.value)} className={inputClass} placeholder={`Feature ${index + 1}`} />
                    <button type="button" onClick={() => removeDynamicListItem(keyFeatures, setKeyFeatures, index)} className="p-2 text-slate-500 hover:text-red-600" aria-label="Remove feature">
                        <XMarkIcon className="w-5 h-5"/>
                    </button>
                </div>
            ))}
            <button type="button" onClick={() => addDynamicListItem(setKeyFeatures)} className="mt-1 text-sm text-[#6C4DFF] hover:text-purple-700 font-medium flex items-center px-3 py-1.5 border border-slate-300 hover:border-purple-400 rounded-md bg-slate-50 hover:bg-purple-50 transition-colors">
                <PlusIcon className="w-4 h-4 mr-1.5"/> Add Feature
            </button>
        </div>
        
        <div>
            <label className={labelClass}>Use Cases</label>
            {useCases.map((useCase, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input type="text" value={useCase} onChange={(e) => handleDynamicListChange(useCases, setUseCases, index, e.target.value)} className={inputClass} placeholder={`Use Case ${index + 1}`} />
                    <button type="button" onClick={() => removeDynamicListItem(useCases, setUseCases, index)} className="p-2 text-slate-500 hover:text-red-600" aria-label="Remove use case">
                        <XMarkIcon className="w-5 h-5"/>
                    </button>
                </div>
            ))}
            <button type="button" onClick={() => addDynamicListItem(setUseCases)} className="mt-1 text-sm text-[#6C4DFF] hover:text-purple-700 font-medium flex items-center px-3 py-1.5 border border-slate-300 hover:border-purple-400 rounded-md bg-slate-50 hover:bg-purple-50 transition-colors">
                <PlusIcon className="w-4 h-4 mr-1.5"/> Add Use Case
            </button>
        </div>

        <div>
            <label htmlFor="logoUrl" className={labelClass}>Logo (URL)</label>
            <div className="mt-1 flex items-center space-x-3 p-4 border-2 border-dashed border-slate-300 rounded-md hover:border-purple-400">
                <UploadIcon className="w-10 h-10 text-slate-400" />
                <div className="flex-grow">
                    <input type="url" id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={`${inputClass} border-none focus:ring-0 p-0`} placeholder="https://example.com/logo.png" />
                    <p className="text-xs text-slate-500 mt-0.5">Upload a logo for your tool. Recommended: square format, 512x512px.</p>
                </div>
            </div>
        </div>
        
        <div>
            <label className={labelClass}>Screenshots (URLs)</label>
            {screenshotUrls.map((ssUrl, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input type="url" value={ssUrl} onChange={(e) => handleDynamicListChange(screenshotUrls, setScreenshotUrls, index, e.target.value)} className={inputClass} placeholder={`Screenshot URL ${index + 1}`} />
                     <button type="button" onClick={() => removeDynamicListItem(screenshotUrls, setScreenshotUrls, index)} className="p-2 text-slate-500 hover:text-red-600" aria-label="Remove screenshot URL">
                        <XMarkIcon className="w-5 h-5"/>
                    </button>
                </div>
            ))}
             <button type="button" onClick={() => addDynamicListItem(setScreenshotUrls)} className="mt-1 text-sm text-[#6C4DFF] hover:text-purple-700 font-medium flex items-center px-3 py-1.5 border border-slate-300 hover:border-purple-400 rounded-md bg-slate-50 hover:bg-purple-50 transition-colors">
                <PlusIcon className="w-4 h-4 mr-1.5"/> Add Screenshot URL
            </button>
            <p className="text-xs text-slate-500 mt-1">Upload screenshots showcasing the tool (optional). Images will be displayed in a gallery.</p>
        </div>
        
        {error && <p className="text-red-500 text-sm p-3 bg-red-50 rounded-md border border-red-200">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm p-3 bg-green-50 rounded-md border border-green-200">{successMessage}</p>}
        
        <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-2.5 bg-[#6C4DFF] hover:bg-purple-700 text-white font-semibold rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
            {isLoading ? <LoadingSpinner size="sm" color="#FFFFFF" /> : 'Submit Tool'}
            </button>
        </div>
      </form>
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

export default SubmitToolPage;