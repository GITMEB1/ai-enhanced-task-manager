import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRetrying: boolean;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    isRetrying: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        isRetrying: true 
      });
      
      // Reset retry state after a brief moment
      setTimeout(() => {
        this.setState({ isRetrying: false });
      }, 500);
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorMessage = (error?: Error): string => {
    if (!error) return 'An unexpected error occurred';
    
    // Provide user-friendly messages for common errors
    if (error.message.includes('ChunkLoadError')) {
      return 'Failed to load application resources. Please refresh the page.';
    }
    if (error.message.includes('Network Error')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }
    
    return 'Something went wrong. Our team has been notified.';
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;
      const errorMessage = this.getErrorMessage(this.state.error);

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Error Icon */}
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              {/* Error Message */}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {errorMessage}
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                    {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                  </button>
                )}
                
                <button
                  onClick={this.handleRefresh}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
              
              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs">
                    <div className="mb-2">
                      <strong className="text-red-600 dark:text-red-400">Error:</strong>
                      <pre className="mt-1 text-red-600 dark:text-red-400 whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong className="text-red-600 dark:text-red-400">Stack Trace:</strong>
                        <pre className="mt-1 text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              {/* Retry Counter */}
              {!canRetry && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Maximum retry attempts reached. Please refresh the page.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary; 