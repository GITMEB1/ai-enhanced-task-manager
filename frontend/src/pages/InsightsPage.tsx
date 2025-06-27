import React, { useEffect } from 'react';
import { useIntegrationStore } from '../stores/integrationStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const InsightsPage: React.FC = () => {
  const {
    insights,
    taskSuggestions,
    journalPrompts,
    serviceStatus,
    insightsLoading,
    insightsError,
    poweredBy,
    serviceMode,
    acceptingSuggestion,
    fetchServiceStatus,
    fetchInsights,
    acceptTaskSuggestion,
    acceptJournalPrompt,
    clearError
  } = useIntegrationStore();

  useEffect(() => {
    fetchServiceStatus();
    fetchInsights();
  }, [fetchServiceStatus, fetchInsights]);

  const handleAcceptTaskSuggestion = async (suggestion: any) => {
    await acceptTaskSuggestion(suggestion);
    // Optionally show success message
  };

  const handleAcceptJournalPrompt = async (prompt: any) => {
    await acceptJournalPrompt(prompt);
    // Optionally show success message
  };

  const handleRefreshInsights = () => {
    fetchInsights();
  };

  if (insightsLoading && insights.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover patterns and get personalized recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Service Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            serviceMode === 'enhanced' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {serviceMode === 'enhanced' ? '🧠 AI Enhanced' : '📊 Basic Patterns'}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefreshInsights}
            disabled={insightsLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {insightsLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {insightsError && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{insightsError}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Insights */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📈 Productivity Insights
          </h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {insight.title || insight.message}
                    </h3>
                    {insight.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {insight.description}
                      </p>
                    )}
                    {insight.suggested_actions && insight.suggested_actions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Suggested Actions:</p>
                        <ul className="mt-1 text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                          {insight.suggested_actions.map((action, actionIndex) => (
                            <li key={actionIndex}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(insight.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Suggestions */}
      {taskSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            ✨ Suggested Tasks
          </h2>
          <div className="space-y-4">
            {taskSuggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.description || suggestion.content}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : suggestion.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.reasoning}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptTaskSuggestion(suggestion)}
                    disabled={acceptingSuggestion}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {acceptingSuggestion ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Accept'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Prompts */}
      {journalPrompts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📝 Journal Prompts
          </h2>
          <div className="space-y-4">
            {journalPrompts.map((prompt, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {prompt.prompt}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {prompt.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {prompt.context}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptJournalPrompt(prompt)}
                    disabled={acceptingSuggestion}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {acceptingSuggestion ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Use Prompt'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!insightsLoading && insights.length === 0 && taskSuggestions.length === 0 && journalPrompts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Insights Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {serviceMode === 'basic' 
              ? 'Create some tasks and journal entries to see pattern-based insights.'
              : 'AI insights will appear here based on your activity patterns.'
            }
          </p>
          <button
            onClick={handleRefreshInsights}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Service Status Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Powered by {poweredBy === 'AI' ? 'OpenAI GPT' : 'Pattern Analysis'} • 
        {serviceStatus?.features.ai_insights ? ' Enhanced AI features active' : ' Basic features active'}
      </div>
    </div>
  );
};

export default InsightsPage; 