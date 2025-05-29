import React, { useState } from 'react';
import { getProducts, addProduct } from '../services/supabaseProductService';

const TestAdminPage: React.FC = () => {
  const [message, setMessage] = useState<string>('Page loaded successfully!');
  const [loading, setLoading] = useState<boolean>(false);

  const testBasic = () => {
    setMessage('Basic test worked!');
  };

  const testEnvironment = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    // Check all process.env variables for debugging
    const allEnvVars = Object.keys(process.env).filter(key => key.includes('SUPABASE') || key.includes('API'));
    
    let debugInfo = `Environment Debug Info:\n`;
    debugInfo += `All env vars with SUPABASE/API: ${allEnvVars.join(', ') || 'NONE'}\n`;
    debugInfo += `SUPABASE_URL: ${supabaseUrl || 'MISSING'}\n`;
    debugInfo += `SUPABASE_ANON_KEY: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING'}\n\n`;
    
    if (supabaseUrl && supabaseKey) {
      debugInfo += `✅ Environment variables loaded successfully!`;
    } else {
      debugInfo += `❌ Environment variables missing!\n\nTroubleshooting:\n`;
      debugInfo += `1. Check if .env file exists in project root\n`;
      debugInfo += `2. Restart dev server after creating/editing .env\n`;
      debugInfo += `3. Make sure .env has no extra spaces around =\n`;
      debugInfo += `4. Check that .env is not in .gitignore`;
    }
    
    setMessage(debugInfo);
  };

  const testFetchProducts = async () => {
    setLoading(true);
    setMessage('🔄 Testing fetch products...');
    
    try {
      const data = await getProducts();
      setMessage(`✅ Fetch SUCCESS: Found ${data?.length || 0} products. ${data?.length === 0 ? '(Empty database is normal for new setup)' : ''}`);
    } catch (error: any) {
      setMessage(`❌ Fetch FAILED: ${error.message}`);
      console.error('Fetch error:', error);
    }
    
    setLoading(false);
  };

  const testAddProduct = async () => {
    setLoading(true);
    setMessage('🔄 Testing add product...');
    
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      description: 'This is a test product created at ' + new Date().toLocaleString(),
      website_url: 'https://example.com',
      pricing: 'Free',
      source: 'Open Source',
      tags: ['test', 'example'],
      features: ['Test feature 1', 'Test feature 2'],
      use_cases: ['Testing', 'Demo purposes']
    };

    try {
      const data = await addProduct(testProduct);
      setMessage(`✅ Add SUCCESS: Product created successfully!`);
      console.log('Created product:', data);
    } catch (error: any) {
      setMessage(`❌ Add FAILED: ${error.message}`);
      console.error('Add error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-6">🧪 Debug Test Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Debug Tests</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={testBasic}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            🔄 Test Basic Function
          </button>
          
          <button
            onClick={testEnvironment}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            🔧 Test Environment Variables
          </button>
          
          <button
            onClick={testFetchProducts}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {loading ? '⏳ Testing...' : '📥 Test Fetch Products'}
          </button>
          
          <button
            onClick={testAddProduct}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            {loading ? '⏳ Testing...' : '➕ Test Add Product'}
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="text-lg font-medium text-[#0F172A] mb-2">Test Results:</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{message}</pre>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-red-800 mb-2">🚨 If Env Vars Still Missing:</h3>
        <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
          <li>Make sure .env file is in the ROOT folder (same as package.json)</li>
          <li>Make sure .env file contains exactly (no extra spaces):</li>
          <li className="font-mono bg-red-100 p-2 rounded">SUPABASE_URL=https://yeiqefsnxhodngcoiqeg.supabase.co</li>
          <li className="font-mono bg-red-100 p-2 rounded">SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</li>
          <li>Stop server (Ctrl+C) and restart with: npm run dev</li>
        </ol>
      </div>
    </div>
  );
};

export default TestAdminPage; 