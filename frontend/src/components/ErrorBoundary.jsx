import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
          <h1 className="text-3xl font-bold text-destructive">Something went wrong</h1>
          <p className="max-w-md mt-2 text-muted-foreground">
            {this.state.error?.toString() || "An unexpected error occurred."}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 mt-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;