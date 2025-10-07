import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error caught by ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    this.setState({ errorInfo });

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: 'anonymous',
      };

      // Store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('healthcare_app_errors') || '[]');
      existingErrors.push(errorReport);
      localStorage.setItem('healthcare_app_errors', JSON.stringify(existingErrors.slice(-10)));
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('healthcare_app_cache');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => console.warn('Failed to copy error details'));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
          <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-6 border border-red-200">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                System Error
              </h1>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                خطأ في النظام
              </h2>

              {/* Error Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                An unexpected error occurred in the Healthcare Management System. 
                Our team has been notified and is working to resolve this issue.
              </p>
              <p className="text-gray-600 mb-6 text-sm" dir="rtl">
                حدث خطأ غير متوقع في نظام إدارة الرعاية الصحية. تم إشعار فريقنا وهو يعمل على حل هذه المشكلة.
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Technical Details
                  </h4>
                  <p className="text-xs text-red-600 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.retryCount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Retry attempts: {this.state.retryCount}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-5 h-5" />
                  {this.state.retryCount >= 3 ? 'Maximum retries reached' : 'Try Again / إعادة المحاولة'}
                </button>

                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset Application / إعادة تشغيل التطبيق
                </button>

                <button
                  onClick={this.handleHome}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Home className="w-5 h-5" />
                  Go to Home / الذهاب للرئيسية
                </button>

                {/* Copy Error Details (Development) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={this.copyErrorDetails}
                    className="w-full text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Copy Error Details
                  </button>
                )}
              </div>

              {/* Support Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  If this issue persists, please contact IT Support at: 
                  <br />
                  <span className="font-mono">support@kahbisha.health.sa</span>
                </p>
                <p className="text-xs text-gray-500 mt-1" dir="rtl">
                  إذا استمرت هذه المشكلة، يرجى الاتصال بالدعم الفني
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;