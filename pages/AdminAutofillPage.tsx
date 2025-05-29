import React, { useState } from 'react';
import { extractToolDataWithCrawl4AI, LLMExtractedToolData } from '../services/llmExtractionService';
import { addProduct } from '../services/supabaseProductService';

const AdminAutofillPage: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<LLMExtractedToolData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Form state for editing extracted data
  const [formData, setFormData] = useState<LLMExtractedToolData>({
    name: '',
    description: '',
    features: [''],
    categories: [''],
    useCases: [''],
    pricing: 'Free',
    logoUrl: '',
    screenshotUrls: [''],
    tags: ['']
  });

  const handleExtract = async () => {
    if (!url.trim()) {
      setMessage('Please enter a valid URL');
      return;
    }

    setIsExtracting(true);
    setMessage('🔄 Extracting product data from website using Crawl4AI...');

    try {
      const extracted = await extractToolDataWithCrawl4AI(url);
      setExtractedData(extracted);
      setFormData({
        name: extracted.name || '',
        description: extracted.description || '',
        features: extracted.features && extracted.features.length > 0 ? extracted.features : [''],
        categories: extracted.categories && extracted.categories.length > 0 ? extracted.categories : [''],
        useCases: extracted.useCases && extracted.useCases.length > 0 ? extracted.useCases : [''],
        pricing: extracted.pricing || 'Free',
        logoUrl: extracted.logoUrl || '',
        screenshotUrls: extracted.screenshotUrls && extracted.screenshotUrls.length > 0 ? extracted.screenshotUrls : [''],
        tags: extracted.tags && extracted.tags.length > 0 ? extracted.tags : ['']
      });
      setMessage('✅ Product data extracted and autofilled! Review and edit below, then save.');
    } catch (error: any) {
      setMessage(`❌ Extraction failed: ${error.message}`);
      setExtractedData(null);
    }

    setIsExtracting(false);
  };

  const handleArrayChange = (field: keyof LLMExtractedToolData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? (prev[field] as string[]).map((item, i) => i === index ? value : item) : prev[field]
    }));
  };

  const addArrayItem = (field: keyof LLMExtractedToolData) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? [...(prev[field] as string[]), ''] : prev[field]
    }));
  };

  const removeArrayItem = (field: keyof LLMExtractedToolData, index: number) => {
    if (Array.isArray(formData[field]) && (formData[field] as string[]).length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      setMessage('❌ Name and description are required');
      return;
    }

    setIsSubmitting(true);
    setMessage('🔄 Saving product to database...');

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        website_url: url,
        logo_url: formData.logoUrl,
        features: formData.features.filter(f => f.trim()),
        use_cases: formData.useCases.filter(uc => uc.trim()),
        pricing: formData.pricing,
        source: 'Closed Source', // Default
        tags: formData.tags.filter(t => t.trim()),
        categories: formData.categories.filter(c => c.trim()),
        screenshot_urls: formData.screenshotUrls?.filter(s => s.trim()) || []
      };

      await addProduct(productData);
      setMessage('✅ Product saved successfully to database!');
      setUrl('');
      setExtractedData(null);
      setFormData({
        name: '',
        description: '',
        features: [''],
        categories: [''],
        useCases: [''],
        pricing: 'Free',
        logoUrl: '',
        screenshotUrls: [''],
        tags: ['']
      });
    } catch (error: any) {
      setMessage(`❌ Save failed: ${error.message}`);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-6">🤖 Admin AI Autofill (Crawl4AI)</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">1. Extract Product Data</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isExtracting}
          />
          <button
            onClick={handleExtract}
            disabled={isExtracting || !url.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {isExtracting ? '⏳ Extracting...' : '🚀 Fetch & Generate Details'}
          </button>
        </div>
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm text-gray-700">{message || 'Enter a product website URL above to extract data automatically.'}</p>
        </div>
      </div>
      {/* Form Section */}
      {extractedData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">2. Review & Edit Extracted Data</h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Features</label>
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={feature}
                    onChange={e => handleArrayChange('features', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => removeArrayItem('features', idx)} className="px-2 text-red-500">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('features')} className="mt-1 px-3 py-1 bg-gray-200 rounded">+ Add Feature</button>
            </div>
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              {formData.categories.map((cat, idx) => (
                <div key={idx} className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={cat}
                    onChange={e => handleArrayChange('categories', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => removeArrayItem('categories', idx)} className="px-2 text-red-500">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('categories')} className="mt-1 px-3 py-1 bg-gray-200 rounded">+ Add Category</button>
            </div>
            {/* Use Cases */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Use Cases</label>
              {formData.useCases.map((uc, idx) => (
                <div key={idx} className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={uc}
                    onChange={e => handleArrayChange('useCases', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => removeArrayItem('useCases', idx)} className="px-2 text-red-500">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('useCases')} className="mt-1 px-3 py-1 bg-gray-200 rounded">+ Add Use Case</button>
            </div>
            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
              <input
                type="text"
                value={formData.pricing}
                onChange={e => setFormData(prev => ({ ...prev, pricing: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={e => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {formData.logoUrl && <img src={formData.logoUrl} alt="Logo preview" className="h-12 mt-2" />}
            </div>
            {/* Screenshot URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot URLs</label>
              {formData.screenshotUrls?.map((s, idx) => (
                <div key={idx} className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={s}
                    onChange={e => handleArrayChange('screenshotUrls', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => removeArrayItem('screenshotUrls', idx)} className="px-2 text-red-500">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('screenshotUrls')} className="mt-1 px-3 py-1 bg-gray-200 rounded">+ Add Screenshot</button>
            </div>
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              {formData.tags.map((tag, idx) => (
                <div key={idx} className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={tag}
                    onChange={e => handleArrayChange('tags', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button type="button" onClick={() => removeArrayItem('tags', idx)} className="px-2 text-red-500">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('tags')} className="mt-1 px-3 py-1 bg-gray-200 rounded">+ Add Tag</button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-400"
            >
              {isSubmitting ? 'Saving...' : 'Save Tool'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAutofillPage; 