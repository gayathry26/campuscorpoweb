import React from 'react';
import { AlertCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('CampusCorpo GlobalErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Module Loading Notice
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                The requested page encountered a rendering condition. You can reload this view or return to the main dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Hub</span>
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                <span>{showDetails ? 'Hide Technical Diagnostics' : 'Show Technical Diagnostics'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDetails && (
                <div className="mt-3 text-left p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed border border-neutral-200/80 dark:border-neutral-700/80">
                  <div className="font-bold text-red-600 dark:text-red-400 mb-1">
                    {error?.toString()}
                  </div>
                  {errorInfo?.componentStack}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
