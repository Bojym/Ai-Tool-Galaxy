import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../services/supabaseAuthService';
import { supabase } from '../services/supabaseClient';

const DebugAuthPage: React.FC = () => {
  const { currentUser, isLoading, refreshUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionTest, setConnectionTest] = useState<any>(null);

  const handleDebugRefresh = async () => {
    setIsRefreshing(true);
    try {
      const freshUser = await getCurrentUser();
      setDebugInfo({
        timestamp: new Date().toISOString(),
        freshUser,
        contextUser: currentUser,
        isLoading,
      });
    } catch (error: any) {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error.message,
        contextUser: currentUser,
        isLoading,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnectionTest = async () => {
    setIsRefreshing(true);
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      setConnectionTest({
        timestamp: new Date().toISOString(),
        success: !error,
        error: error?.message,
        data: data,
        supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      });
    } catch (error: any) {
      setConnectionTest({
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
        supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleContextRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Context refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Auth State */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {currentUser?.id || 'None'}</p>
            <p><strong>Email:</strong> {currentUser?.email || 'None'}</p>
            <p><strong>Username:</strong> {currentUser?.username || 'None'}</p>
            <p><strong>Is Admin:</strong> {currentUser?.isAdmin ? 'Yes' : 'No'}</p>
            <p><strong>Favorites Count:</strong> {currentUser?.favorites?.length || 0}</p>
          </div>
          
          <button
            onClick={handleContextRefresh}
            disabled={isRefreshing}
            className="mt-4 px-4 py-2 bg-[#6C4DFF] text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Auth Context'}
          </button>
        </div>

        {/* Debug Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
          
          <button
            onClick={handleConnectionTest}
            disabled={isRefreshing}
            className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Testing...' : 'Test Supabase Connection'}
          </button>
          
          <button
            onClick={handleDebugRefresh}
            disabled={isRefreshing}
            className="w-full mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Fetching...' : 'Fetch Fresh User Data'}
          </button>

          {connectionTest && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold mb-2">Connection Test:</h3>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(connectionTest, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-semibold mb-2">Debug Results:</h3>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Console Logs */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Check the browser console (F12) for authentication logs</p>
          <p>2. Use "Refresh Auth Context" to force reload your profile</p>
          <p>3. Use "Fetch Fresh User Data" to test direct database access</p>
          <p>4. If stuck loading, try the refresh button in the navbar profile menu</p>
        </div>
      </div>
    </div>
  );
};

export default DebugAuthPage; 