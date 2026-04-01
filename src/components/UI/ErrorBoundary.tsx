import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private isWebGLError(): boolean {
    const msg = this.state.error?.message?.toLowerCase() ?? '';
    return msg.includes('webgl') || msg.includes('context lost') || msg.includes('gpu');
  }

  public render() {
    if (this.state.hasError) {
      const isGfx = this.isWebGLError();
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-stone-900 text-white p-6 text-center">
          <div className="bg-white/10 p-4 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
          <p className="text-stone-400 max-w-md mb-8">
            {isGfx
              ? 'The 3D environment encountered a graphics error. This can happen when the browser\'s WebGL context is lost or runs out of memory.'
              : 'An unexpected error occurred while loading the 3D map. Please try reloading the page.'}
          </p>
          <button
            onClick={this.handleReload}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
