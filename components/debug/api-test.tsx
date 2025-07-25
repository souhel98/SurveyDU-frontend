"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiConfig } from '@/lib/config/api-config';
import api from '@/lib/api/axios';

export default function ApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [testType, setTestType] = useState<string>('api');

  const config = getApiConfig();

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test 1: Simple GET request to check if backend is reachable
      const response = await api.get('/Auth/login', { 
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status code
      });
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        config: {
          baseURL: response.config?.baseURL || 'undefined',
          url: response.config?.url || 'undefined',
          fullURL: (response.config?.baseURL || '') + (response.config?.url || '')
        }
      });
    } catch (err: any) {
      setError({
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${config.BASE_URL}/Auth/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      const data = await response.text();
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
    } catch (err: any) {
      setError({
        message: err.message,
        type: 'fetch',
        url: `${config.BASE_URL}/Auth/login`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendHealth = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Try to reach the base URL without any endpoint
      const response = await fetch(config.BASE_URL, {
        method: 'GET',
        mode: 'cors',
      });
      
      const data = await response.text();
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: response.url
      });
    } catch (err: any) {
      setError({
        message: err.message,
        type: 'health-check',
        url: config.BASE_URL
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = () => {
    switch (testType) {
      case 'api':
        testConnection();
        break;
      case 'fetch':
        testDirectFetch();
        break;
      case 'health':
        testBackendHealth();
        break;
      default:
        testConnection();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔧 API Connection Test</CardTitle>
          <CardDescription>
            Test the connection to your backend API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current Configuration:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <div><strong>Base URL:</strong> {config.BASE_URL}</div>
                <div><strong>Timeout:</strong> {config.TIMEOUT}ms</div>
                <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
                <div><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Test Options:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="api"
                    name="testType"
                    value="api"
                    checked={testType === 'api'}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <label htmlFor="api" className="text-sm">Axios API Call</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fetch"
                    name="testType"
                    value="fetch"
                    checked={testType === 'fetch'}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <label htmlFor="fetch" className="text-sm">Direct Fetch</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="health"
                    name="testType"
                    value="health"
                    checked={testType === 'health'}
                    onChange={(e) => setTestType(e.target.value)}
                  />
                  <label htmlFor="health" className="text-sm">Backend Health Check</label>
                </div>
              </div>
              <Button 
                onClick={runTest} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-3"
              >
                {isLoading ? 'Testing...' : 'Run Test'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-semibold text-red-800 mb-2">❌ Connection Error:</h4>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Connection Result:</h4>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Troubleshooting Steps for Network Error:</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li><strong>1. Check if backend is running:</strong> Try accessing <a href={config.BASE_URL} target="_blank" rel="noopener noreferrer" className="underline">{config.BASE_URL}</a> directly in your browser</li>
              <li><strong>2. Verify backend URL:</strong> Make sure your backend is actually running at the configured URL</li>
              <li><strong>3. Check CORS settings:</strong> Your backend needs to allow requests from localhost:3000</li>
              <li><strong>4. Try different test types:</strong> Use the radio buttons above to test different connection methods</li>
              <li><strong>5. Check firewall/antivirus:</strong> Some security software might block localhost connections</li>
              <li><strong>6. Environment variable:</strong> Create a .env.local file with the correct backend URL</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🔧 Quick Fixes:</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>For local development:</strong> Create a .env.local file with:</p>
              <code className="bg-yellow-100 p-2 rounded block">
                NEXT_PUBLIC_API_URL=http://localhost:5000/api
              </code>
              <p><strong>For HTTPS backend:</strong> Ensure CORS is configured to allow localhost:3000</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 