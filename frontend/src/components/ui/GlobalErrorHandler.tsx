import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

// Global error event listener
const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Show user-friendly error message
      if (event.reason?.message) {
        const message = event.reason.message;
        
        // Handle specific error types
        if (message.includes('Network Error') || message.includes('fetch')) {
          toast.error('Network connection issue. Please check your internet connection.');
        } else if (message.includes('401') || message.includes('Unauthorized')) {
          toast.error('Your session has expired. Please log in again.');
        } else if (message.includes('403') || message.includes('Forbidden')) {
          toast.error('Access denied. You don\'t have permission for this action.');
        } else if (message.includes('404') || message.includes('Not Found')) {
          toast.error('The requested resource was not found.');
        } else if (message.includes('500') || message.includes('Internal Server Error')) {
          toast.error('Server error. Please try again later.');
        } else {
          // Generic error message for unknown errors
          toast.error('Something went wrong. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
      
      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Handle JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Handle specific error types
      if (event.error?.name === 'ChunkLoadError') {
        toast.error('Failed to load application resources. Please refresh the page.', {
          duration: 6000,
        });
      } else if (event.error?.message?.includes('Loading chunk')) {
        toast.error('Application update available. Please refresh the page.', {
          duration: 6000,
        });
      } else {
        toast.error('An unexpected error occurred.');
      }
    };

    // Handle resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target?.tagName === 'SCRIPT') {
        console.error('Script loading error:', target);
        toast.error('Failed to load application scripts. Please refresh the page.');
      } else if (target?.tagName === 'LINK') {
        console.error('Stylesheet loading error:', target);
        toast.error('Failed to load application styles. Please refresh the page.');
      } else if (target?.tagName === 'IMG') {
        console.error('Image loading error:', target);
        // Don't show toast for image errors as they're usually not critical
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('error', handleResourceError, true); // Capture phase for resource errors

    // Cleanup event listeners
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  return <>{children}</>;
};

export default GlobalErrorHandler; 