import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            An unexpected error occurred. Try refreshing the page or click below to retry.
          </p>
          {this.state.error && import.meta.env.DEV && (
            <details className="mb-4 max-w-lg">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Show error details
              </summary>
              <pre className="text-xs text-muted-foreground bg-muted rounded p-3 mt-2 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="default" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
