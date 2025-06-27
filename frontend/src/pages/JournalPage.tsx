import React, { useEffect, useState } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const ENTRY_TYPE_CONFIG = {
  general: { icon: '📝', color: 'bg-gray-100 text-gray-800', label: 'General' },
  reflection: { icon: '🤔', color: 'bg-purple-100 text-purple-800', label: 'Reflection' },
  achievement: { icon: '🏆', color: 'bg-yellow-100 text-yellow-800', label: 'Achievement' },
  idea: { icon: '💡', color: 'bg-blue-100 text-blue-800', label: 'Idea' },
  mood: { icon: '😊', color: 'bg-pink-100 text-pink-800', label: 'Mood Check' },
  goal_progress: { icon: '🎯', color: 'bg-green-100 text-green-800', label: 'Goal Progress' },
  learning: { icon: '📚', color: 'bg-indigo-100 text-indigo-800', label: 'Learning' },
  decision: { icon: '⚖️', color: 'bg-orange-100 text-orange-800', label: 'Decision' },
  gratitude: { icon: '🙏', color: 'bg-emerald-100 text-emerald-800', label: 'Gratitude' }
};

const JournalPage: React.FC = () => {
  const { 
    entries, 
    stats, 
    loading, 
    error, 
    fetchEntries, 
    fetchStats,
    quickEntry,
    clearError 
  } = useJournalStore();
  
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntryContent, setQuickEntryContent] = useState('');

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [fetchEntries, fetchStats]);

  const handleQuickEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickEntryContent.trim()) {
      try {
        await quickEntry(quickEntryContent);
        setQuickEntryContent('');
        setShowQuickEntry(false);
      } catch (error) {
        console.error('Error creating quick entry:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Journal
            </h1>
            <p className="text-gray-600 mt-2">Capture your thoughts, achievements, and reflections</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowQuickEntry(!showQuickEntry)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Quick Entry
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Quick Entry Form */}
        {showQuickEntry && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Entry</h3>
            <form onSubmit={handleQuickEntry}>
              <textarea
                value={quickEntryContent}
                onChange={(e) => setQuickEntryContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickEntry(false);
                    setQuickEntryContent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_entries}</p>
                </div>
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Words Written</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_words.toLocaleString()}</p>
                </div>
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.entries_this_month}</p>
                </div>
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Mood</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.average_mood ? stats.average_mood.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <span className="text-2xl">😊</span>
              </div>
            </div>
          </div>
        )}

        {/* Journal Entries */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No journal entries yet</h3>
              <p className="text-gray-600 mb-6">Start your journaling journey by creating your first entry.</p>
              <button
                onClick={() => setShowQuickEntry(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Entry
              </button>
            </div>
          ) : (
            entries.map((entry) => {
              const typeConfig = ENTRY_TYPE_CONFIG[entry.entry_type];
              
              return (
                <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
                        <span className="mr-1">{typeConfig.icon}</span>
                        {typeConfig.label}
                      </span>
                      {entry.mood_rating && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Mood: {entry.mood_rating}/10
                        </span>
                      )}
                      {entry.energy_level && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Energy: {entry.energy_level}/10
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <div>{formatDate(entry.entry_date)}</div>
                      {entry.time_of_day && (
                        <div className="capitalize">{entry.time_of_day}</div>
                      )}
                    </div>
                  </div>
                  
                  {entry.title && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{entry.title}</h3>
                  )}
                  
                  <div className="text-gray-700 mb-4">
                    <p className="line-clamp-3">{entry.content}</p>
                  </div>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>{entry.word_count} words</span>
                      <span>{entry.reading_time_minutes} min read</span>
                    </div>
                    <div>
                      Created {formatTime(entry.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;