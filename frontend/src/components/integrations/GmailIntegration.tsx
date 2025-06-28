import React, { useEffect } from 'react';
import { useIntegrationStore } from '../../stores/integrationStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const GmailIntegration: React.FC = () => {
  const {
    emails,
    gmailAuthUrl,
    emailsLoading,
    gmailConnected,
    selectedEmailIds,
    convertingEmails,
    getGmailAuthUrl,
    fetchEmails,
    convertEmailsToTasks,
    toggleEmailSelection,
    selectAllEmails,
    clearEmailSelection
  } = useIntegrationStore();

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleConnectGmail = () => {
    if (!gmailAuthUrl) {
      getGmailAuthUrl();
    }
    if (gmailAuthUrl) {
      window.open(gmailAuthUrl, '_blank');
    }
  };

  const handleConvertSelected = () => {
    if (selectedEmailIds.length > 0) {
      convertEmailsToTasks(selectedEmailIds);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            📧 Gmail Integration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Convert actionable emails into tasks automatically
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            gmailConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}>
            {gmailConnected ? '✅ Connected' : '⚪ Disconnected'}
          </div>
          
          {/* Connect/Refresh Button */}
          {!gmailConnected ? (
            <button
              onClick={handleConnectGmail}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Authenticate Gmail
            </button>
          ) : (
            <button
              onClick={fetchEmails}
              disabled={emailsLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {emailsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {emails.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedEmailIds.length} of {emails.length} selected
            </span>
            <button
              onClick={selectAllEmails}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              Select All
            </button>
            {selectedEmailIds.length > 0 && (
              <button
                onClick={clearEmailSelection}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                Clear Selection
              </button>
            )}
          </div>
          
          {selectedEmailIds.length > 0 && (
            <button
              onClick={handleConvertSelected}
              disabled={convertingEmails}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {convertingEmails ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              Convert to Tasks ({selectedEmailIds.length})
            </button>
          )}
        </div>
      )}

      {/* Authentication Notice */}
      {!gmailConnected && emails.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              You're viewing sample data. Authenticate with Gmail to see your actual emails.
            </span>
          </div>
        </div>
      )}

      {/* Email List */}
      {emailsLoading && emails.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      ) : emails.length > 0 ? (
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedEmailIds.includes(email.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => toggleEmailSelection(email.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedEmailIds.includes(email.id)}
                      onChange={() => toggleEmailSelection(email.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {email.subject}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      From: {email.sender}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {email.date}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                      {email.priority} priority
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {email.snippet}
                  </p>
                  
                  {email.actionItems && email.actionItems.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Action Items Detected:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                        {email.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {email.labels && email.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {email.labels.map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {email.hasDeadline && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                      ⏰ Has deadline
                    </div>
                  )}
                  {email.estimatedDuration && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ~{email.estimatedDuration}min
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Actionable Emails
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {gmailConnected 
              ? 'No emails with actionable content found.'
              : 'Connect your Gmail account to see actionable emails here.'
            }
          </p>
          {gmailConnected && (
            <button
              onClick={fetchEmails}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Emails
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GmailIntegration; 