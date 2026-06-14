import React, { StrictMode, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#09090b', color: '#f4f4f5', fontFamily: 'monospace', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '600px', width: '100%', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '8px' }}>
            <h1 style={{ color: '#ef4444', fontSize: '20px', margin: '0 0 10px 0' }}>🚨 Critical Rendering Crash Detected</h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>An error occurred during the rendering of the application components:</p>
            <pre style={{ background: '#18181b', padding: '15px', borderRadius: '4px', overflowX: 'auto', border: '1px solid #27272a', whiteSpace: 'pre-wrap', color: '#fca5a5', fontSize: '12px' }}>
              {this.state.error && this.state.error.toString()}
              {"\n\n"}
              {this.state.error && this.state.error.stack}
            </pre>
            <button onClick={() => window.location.reload()} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '10px' }}>
              RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


