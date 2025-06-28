import React, { useEffect, useState } from 'react';
import { useIntegrationStore } from '../stores/integrationStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import GmailIntegration from '../components/integrations/GmailIntegration';

const IntegrationsPage: React.FC = () => {
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const {
    serviceStatus,
    serviceStatusLoading,
    fetchServiceStatus,
    fetchEmails
  } = useIntegrationStore();

  useEffect(() => {
    fetchServiceStatus();
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gmailAuth = urlParams.get('gmail_auth');
    const error = urlParams.get('error');
    
    if (gmailAuth === 'success') {
      console.log('Gmail authentication successful');
      setAuthSuccess(true);
      // Refresh service status and emails
      setTimeout(() => {
        fetchServiceStatus();
        fetchEmails();
      }, 1000);
      
      // Hide success message after 5 seconds
      setTimeout(() => setAuthSuccess(false), 5000);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('Gmail authentication error:', error);
      setAuthError(decodeURIComponent(error));
      
      // Hide error message after 10 seconds
      setTimeout(() => setAuthError(null), 10000);
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchServiceStatus, fetchEmails]);

  if (serviceStatusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect external services to enhance your task management experience
        </p>
      </div>

      {/* Success Message */}
      {authSuccess && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">
              Gmail authentication successful! You can now access your real emails.
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {authError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="text-red-800 dark:text-red-200 font-medium">
                Gmail authentication failed: 
              </span>
              <span className="text-red-700 dark:text-red-300 ml-1">
                {authError}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Service Status Overview */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Service Status
        </h2>
        
        {serviceStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Service Status */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  🧠 AI Insights Service
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  serviceStatus.rag_service.ready 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : serviceStatus.rag_service.configured
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {serviceStatus.rag_service.ready ? 'Active' : serviceStatus.rag_service.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {serviceStatus.rag_service.ready 
                  ? 'AI-powered insights and suggestions are active'
                  : serviceStatus.rag_service.configured 
                  ? 'AI service is configured but not ready'
                  : 'Configure OpenAI API key to enable AI features'
                }
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Available: {serviceStatus.rag_service.available ? 'Yes' : 'No'} • 
                Configured: {serviceStatus.rag_service.configured ? 'Yes' : 'No'}
              </div>
            </div>

            {/* Gmail Service Status */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  📧 Gmail Integration
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  serviceStatus.gmail_service.authenticated 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : serviceStatus.gmail_service.configured
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {serviceStatus.gmail_service.authenticated ? 'Authenticated' : serviceStatus.gmail_service.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {serviceStatus.gmail_service.authenticated 
                  ? 'Gmail integration is active and authenticated'
                  : serviceStatus.gmail_service.configured 
                  ? 'Gmail is configured but requires authentication'
                  : 'Configure Google OAuth credentials to enable Gmail features'
                }
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Available: {serviceStatus.gmail_service.available ? 'Yes' : 'No'} • 
                Configured: {serviceStatus.gmail_service.configured ? 'Yes' : 'No'} •
                Authenticated: {serviceStatus.gmail_service.authenticated ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">Unable to load service status</p>
          </div>
        )}
      </div>

      {/* Available Features */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Available Features
        </h2>
        
        {serviceStatus ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  serviceStatus.features.ai_insights ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-900 dark:text-white">AI-Powered Insights</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {serviceStatus.features.ai_insights ? 'Enhanced mode' : 'Basic patterns only'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  serviceStatus.features.gmail_integration ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-sm text-gray-900 dark:text-white">Gmail Integration</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {serviceStatus.features.gmail_integration ? 'Available' : 'Not configured'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                <span className="text-sm text-gray-900 dark:text-white">Basic Pattern Analysis</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Always available</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">Unable to load feature status</p>
          </div>
        )}
      </div>

      {/* Gmail Integration Component */}
      {serviceStatus?.gmail_service.configured && (
        <GmailIntegration />
      )}

      {/* Setup Instructions */}
      {serviceStatus && (!serviceStatus.rag_service.configured || !serviceStatus.gmail_service.configured) && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-4">
            🚀 Unlock Enhanced Features
          </h2>
          
          <div className="space-y-4">
            {!serviceStatus.rag_service.configured && (
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Enable AI-Powered Insights
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  Add your OpenAI API key to unlock intelligent task suggestions, productivity insights, and personalized journal prompts.
                </p>
                <div className="bg-blue-100 dark:bg-blue-800 rounded p-3">
                  <code className="text-xs text-blue-900 dark:text-blue-200">
                    OPENAI_API_KEY=your_api_key_here
                  </code>
                </div>
              </div>
            )}
            
            {!serviceStatus.gmail_service.configured && (
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Enable Gmail Integration
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  Configure Google OAuth credentials to enable email-to-task conversion and smart email analysis.
                </p>
                <div className="bg-blue-100 dark:bg-blue-800 rounded p-3">
                  <code className="text-xs text-blue-900 dark:text-blue-200">
                    GOOGLE_CLIENT_ID=your_client_id<br/>
                    GOOGLE_CLIENT_SECRET=your_client_secret
                  </code>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-blue-700 dark:text-blue-400">
            💡 Tip: These features work independently. You can enable one without the other.
          </div>
        </div>
      )}

      {/* All Features Enabled */}
      {serviceStatus?.rag_service.ready && serviceStatus?.gmail_service.configured && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-lg font-medium text-green-900 dark:text-green-200 mb-2">
            All Enhanced Features Active!
          </h2>
          <p className="text-sm text-green-800 dark:text-green-300">
            You have access to AI-powered insights, intelligent task suggestions, and Gmail integration.
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage; 