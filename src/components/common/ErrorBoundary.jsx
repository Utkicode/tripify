import React from'react';
import { Warning, ArrowsClockwise } from'@phosphor-icons/react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen  flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                        <div className="w-16 h-16  text-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Warning size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-8">
                            We're sorry, but an unexpected error occurred. We've logged this issue and are working to fix it.
                        </p>

                        {import.meta.env.DEV && (
                            <div className="rounded-lg p-4 mb-8 text-left overflow-auto max-h-32 text-xs font-mono text-slate-600">
                                {this.state.error && this.state.error.toString()}
                            </div>
                        )}
                        {!import.meta.env.DEV && (
                            <p className="text-sm text-slate-500 mb-8">An unexpected error occurred. Please try refreshing the page.</p>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
                        >
                            <ArrowsClockwise size={16} /> Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
