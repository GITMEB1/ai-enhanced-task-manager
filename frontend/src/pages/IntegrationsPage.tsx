import React, { useEffect } from 'react';
import { useIntegrationStore } from '../stores/integrationStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import GmailIntegration from '../components/integrations/GmailIntegration';

const IntegrationsPage: React.FC = () => {
  const {
    serviceStatus,
    serviceStatusLoading,
    fetchServiceStatus
  } = useIntegrationStore();

  useEffect(() => {
    fetchServiceStatus();
  }, [fetchServiceStatus]);

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
                  serviceStatus.gmail_service.configured 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {serviceStatus.gmail_service.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {serviceStatus.gmail_service.configured 
                  ? 'Gmail integration is available for email-to-task conversion'
                  : 'Configure Google OAuth credentials to enable Gmail features'
                }
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Available: {serviceStatus.gmail_service.available ? 'Yes' : 'No'} • 
                Configured: {serviceStatus.gmail_service.configured ? 'Yes' : 'No'}
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