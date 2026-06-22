import React, { useState, useEffect } from 'react';
import { getApplications } from '../utils/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('🔄 Connecting to backend...');
      const result = await getApplications();
      setData(result);
      setStatus('✅ Connected successfully!');
      setError(null);
    } catch (err) {
      setStatus('❌ Connection failed');
      setError(err.message);
      console.error('Connection error:', err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔌 Backend Connection Test</h1>
      
      <div className={`p-4 rounded-lg mb-4 ${
        status.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' :
        status.includes('❌') ? 'bg-red-100 text-red-700 border border-red-300' :
        'bg-yellow-100 text-yellow-700 border border-yellow-300'
      }`}>
        <p className="font-semibold">{status}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <p className="font-bold text-red-700">Error Details:</p>
          <p className="text-red-600 text-sm font-mono mt-1">{error}</p>
        </div>
      )}

      {data !== null && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <p className="font-semibold">📊 Applications Found: {data.length}</p>
          {data.length > 0 && (
            <pre className="text-xs mt-2 bg-gray-100 p-3 rounded overflow-auto max-h-60">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
          {data.length === 0 && (
            <p className="text-gray-500 mt-2">No applications yet. Create one in Swagger UI!</p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🔄 Retry Connection
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Backend: https://interview-tracker-api-m3rq.onrender.com | Frontend: http://localhost:5173
        </p>
        <p className="text-sm text-gray-500">
          API Endpoint: https://interview-tracker-api-m3rq.onrender.com/api/v1/applications
        </p>
      </div>
    </div>
  );
};

export default ConnectionTest;