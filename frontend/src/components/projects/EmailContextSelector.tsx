import React, { useState, useEffect } from 'react';
import { integrationAPI } from '../../services/api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Search, Mail, Users, Calendar, CheckSquare, X, Eye } from 'lucide-react';

interface EmailThread {
  id: string;
  threadId: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessage: string;
  snippet: string;
  labels: string[];
}

interface EmailContextSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedThreads: EmailThread[], context: any) => void;
  initialQuery?: string;
}

export const EmailContextSelector: React.FC<EmailContextSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([]);
  const [selectedThreads, setSelectedThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewThread, setPreviewThread] = useState<EmailThread | null>(null);

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      searchEmailThreads();
    }
  }, [isOpen]);

  const searchEmailThreads = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await integrationAPI.searchEmailThreads(searchQuery, 20);
      setEmailThreads(response.data.threads || []);
    } catch (error) {
      console.error('Error searching email threads:', error);
      setError('Failed to search email threads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEmailThreads();
  };

  const toggleThreadSelection = (thread: EmailThread) => {
    setSelectedThreads(prev => {
      const isSelected = prev.some(t => t.id === thread.id);
      if (isSelected) {
        return prev.filter(t => t.id !== thread.id);
      } else {
        return [...prev, thread];
      }
    });
  };

  const analyzeAndSelect = async () => {
    if (selectedThreads.length === 0) return;

    setAnalyzing(true);
    try {
      const threadIds = selectedThreads.map(t => t.threadId);
      const response = await integrationAPI.analyzeEmailContext(threadIds);
      onSelect(selectedThreads, response.data.context);
    } catch (error) {
      console.error('Error analyzing email context:', error);
      setError('Failed to analyze email context. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Email Context for Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email threads (e.g., project name, keywords...)"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Search'}
            </button>
          </form>
          
          {selectedThreads.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {selectedThreads.length} thread(s) selected
              </span>
              <button
                onClick={analyzeAndSelect}
                disabled={analyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {analyzing ? <LoadingSpinner size="sm" /> : 'Analyze & Use Context'}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : emailThreads.length > 0 ? (
              <div className="p-6 space-y-4">
                {emailThreads.map((thread) => {
                  const isSelected = selectedThreads.some(t => t.id === thread.id);
                  return (
                    <div
                      key={thread.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => toggleThreadSelection(thread)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleThreadSelection(thread)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {thread.subject}
                            </h3>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {thread.snippet}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail size={12} />
                              <span>{thread.messageCount} messages</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={12} />
                              <span>{thread.participants.length} participants</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(thread.lastMessage)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewThread(thread);
                          }}
                          className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Mail size={48} className="mb-4" />
                <p className="text-lg font-medium mb-2">No email threads found</p>
                <p className="text-sm">Try different keywords or check your Gmail connection</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Search size={48} className="mb-4" />
                <p className="text-lg font-medium mb-2">Search for email threads</p>
                <p className="text-sm">Enter keywords related to your project to find relevant emails</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Thread Preview Modal */}
      {previewThread && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {previewThread.subject}
              </h3>
              <button
                onClick={() => setPreviewThread(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants:</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewThread.participants.map((participant, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300"
                      >
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {previewThread.snippet}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 