import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { registerSW } from 'virtual:pwa-register'

import './index.css'

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })
}

// Theme detection and application
const applyTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply theme immediately to prevent flash
applyTheme()

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Performance monitoring
if (import.meta.env.DEV) {
  // Enable React DevTools profiler in development
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {}
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.supportsFiber = true
}

// Accessibility announcements
export const announceToScreenReader = (message: string) => {
  const announcementsEl = document.getElementById('announcements')
  if (announcementsEl) {
    announcementsEl.textContent = message
    // Clear after a brief delay
    setTimeout(() => {
      announcementsEl.textContent = ''
    }, 1000)
  }
} 