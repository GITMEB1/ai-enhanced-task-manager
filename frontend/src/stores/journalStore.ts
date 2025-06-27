import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../services/api';

export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  entry_type: JournalEntryType;
  entry_date: string;
  time_of_day?: TimeOfDay;
  tags: string[];
  mood_rating?: number;
  energy_level?: number;
  related_task_ids: string[];
  related_project_ids: string[];
  attachments: AttachmentData[];
  metadata: Record<string, any>;
  word_count: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntry {
  title?: string;
  content: string;
  entry_type?: JournalEntryType;
  entry_date: string;
  time_of_day?: TimeOfDay;
  tags?: string[];
  mood_rating?: number;
  energy_level?: number;
  related_task_ids?: string[];
  related_project_ids?: string[];
  attachments?: AttachmentData[];
  metadata?: Record<string, any>;
}

export interface UpdateJournalEntry {
  title?: string;
  content?: string;
  entry_type?: JournalEntryType;
  entry_date?: string;
  time_of_day?: TimeOfDay;
  tags?: string[];
  mood_rating?: number;
  energy_level?: number;
  related_task_ids?: string[];
  related_project_ids?: string[];
  attachments?: AttachmentData[];
  metadata?: Record<string, any>;
}

export interface JournalFilters {
  entry_type?: JournalEntryType;
  date_from?: string;
  date_to?: string;
  time_of_day?: TimeOfDay;
  tags?: string[];
  mood_min?: number;
  mood_max?: number;
  energy_min?: number;
  energy_max?: number;
  search?: string;
  related_to_task?: string;
  related_to_project?: string;
  limit?: number;
  offset?: number;
}

export type JournalEntryType = 
  | 'general' 
  | 'reflection' 
  | 'achievement' 
  | 'idea' 
  | 'mood' 
  | 'goal_progress' 
  | 'learning' 
  | 'decision' 
  | 'gratitude';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface AttachmentData {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface JournalStats {
  total_entries: number;
  total_words: number;
  total_reading_time: number;
  entries_this_month: number;
  current_streak: number;
  most_used_tags: string[];
  average_mood: number;
  average_energy: number;
  entry_types: Record<string, number>;
}

interface JournalStore {
  // State
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  stats: JournalStats | null;
  filters: JournalFilters;
  loading: boolean;
  error: string | null;

  // Actions
  fetchEntries: (filters?: JournalFilters) => Promise<void>;
  fetchEntry: (id: string) => Promise<void>;
  createEntry: (entry: CreateJournalEntry) => Promise<void>;
  updateEntry: (id: string, updates: UpdateJournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  searchEntries: (searchTerm: string, limit?: number) => Promise<JournalEntry[]>;
  quickEntry: (content: string, entryType?: JournalEntryType, mood?: number, energy?: number) => Promise<void>;
  setFilters: (filters: JournalFilters) => void;
  clearFilters: () => void;
  setCurrentEntry: (entry: JournalEntry | null) => void;
  clearError: () => void;
}

export const useJournalStore = create<JournalStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      entries: [],
      currentEntry: null,
      stats: null,
      filters: {},
      loading: false,
      error: null,

      // Fetch all entries with filters
      fetchEntries: async (filters?: JournalFilters) => {
        set({ loading: true, error: null });
        
        try {
          const queryParams = new URLSearchParams();
          
          const currentFilters = filters || get().filters;
          
          if (currentFilters.entry_type) queryParams.append('entry_type', currentFilters.entry_type);
          if (currentFilters.date_from) queryParams.append('date_from', currentFilters.date_from);
          if (currentFilters.date_to) queryParams.append('date_to', currentFilters.date_to);
          if (currentFilters.time_of_day) queryParams.append('time_of_day', currentFilters.time_of_day);
          if (currentFilters.tags?.length) queryParams.append('tags', currentFilters.tags.join(','));
          if (currentFilters.mood_min !== undefined) queryParams.append('mood_min', currentFilters.mood_min.toString());
          if (currentFilters.mood_max !== undefined) queryParams.append('mood_max', currentFilters.mood_max.toString());
          if (currentFilters.energy_min !== undefined) queryParams.append('energy_min', currentFilters.energy_min.toString());
          if (currentFilters.energy_max !== undefined) queryParams.append('energy_max', currentFilters.energy_max.toString());
          if (currentFilters.search) queryParams.append('search', currentFilters.search);
          if (currentFilters.related_to_task) queryParams.append('related_to_task', currentFilters.related_to_task);
          if (currentFilters.related_to_project) queryParams.append('related_to_project', currentFilters.related_to_project);
          if (currentFilters.limit) queryParams.append('limit', currentFilters.limit.toString());
          if (currentFilters.offset) queryParams.append('offset', currentFilters.offset.toString());

          const response = await api.get(`/journal?${queryParams}`);
          set({ entries: response.data, loading: false });
        } catch (error: any) {
          console.error('Error fetching journal entries:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to fetch journal entries',
            loading: false 
          });
        }
      },

      // Fetch specific entry
      fetchEntry: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/journal/${id}`);
          set({ currentEntry: response.data, loading: false });
        } catch (error: any) {
          console.error('Error fetching journal entry:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to fetch journal entry',
            loading: false 
          });
        }
      },

      // Create new entry
      createEntry: async (entry: CreateJournalEntry) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.post('/journal', entry);
          const newEntry = response.data;
          
          set((state) => ({
            entries: [newEntry, ...state.entries],
            loading: false
          }));
        } catch (error: any) {
          console.error('Error creating journal entry:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to create journal entry',
            loading: false 
          });
        }
      },

      // Update entry
      updateEntry: async (id: string, updates: UpdateJournalEntry) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.put(`/journal/${id}`, updates);
          const updatedEntry = response.data;
          
          set((state) => ({
            entries: state.entries.map(entry => 
              entry.id === id ? updatedEntry : entry
            ),
            currentEntry: state.currentEntry?.id === id ? updatedEntry : state.currentEntry,
            loading: false
          }));
        } catch (error: any) {
          console.error('Error updating journal entry:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to update journal entry',
            loading: false 
          });
        }
      },

      // Delete entry
      deleteEntry: async (id: string) => {
        set({ loading: true, error: null });
        
        try {
          await api.delete(`/journal/${id}`);
          
          set((state) => ({
            entries: state.entries.filter(entry => entry.id !== id),
            currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
            loading: false
          }));
        } catch (error: any) {
          console.error('Error deleting journal entry:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to delete journal entry',
            loading: false 
          });
        }
      },

      // Fetch statistics
      fetchStats: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get('/journal/analytics/stats');
          set({ stats: response.data, loading: false });
        } catch (error: any) {
          console.error('Error fetching journal statistics:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to fetch journal statistics',
            loading: false 
          });
        }
      },

      // Search entries
      searchEntries: async (searchTerm: string, limit?: number) => {
        try {
          const queryParams = limit ? `?limit=${limit}` : '';
          const response = await api.get(`/journal/search/${encodeURIComponent(searchTerm)}${queryParams}`);
          return response.data;
        } catch (error: any) {
          console.error('Error searching journal entries:', error);
          throw new Error(error.response?.data?.error || 'Failed to search journal entries');
        }
      },

      // Quick entry
      quickEntry: async (content: string, entryType?: JournalEntryType, mood?: number, energy?: number) => {
        set({ loading: true, error: null });
        
        try {
          const entryData = {
            content,
            entry_type: entryType || 'general',
            mood_rating: mood,
            energy_level: energy
          };
          
          const response = await api.post('/journal/quick-entry', entryData);
          const newEntry = response.data;
          
          set((state) => ({
            entries: [newEntry, ...state.entries],
            loading: false
          }));
        } catch (error: any) {
          console.error('Error creating quick journal entry:', error);
          set({ 
            error: error.response?.data?.error || 'Failed to create quick journal entry',
            loading: false 
          });
        }
      },

      // Filter management
      setFilters: (filters: JournalFilters) => {
        set({ filters });
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      // Current entry management
      setCurrentEntry: (entry: JournalEntry | null) => {
        set({ currentEntry: entry });
      },

      // Error management
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'journal-store',
    }
  )
);