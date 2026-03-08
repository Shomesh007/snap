import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; errorMsg: string; }

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, errorMsg: '' };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMsg: error.message ?? 'Unknown error' };
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        console.error('[SnapLearn ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', height: '100%',
                        background: '#0a0f1e', color: '#e2e8f0', padding: '2rem', textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😅</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Oops! Kuch galat ho gaya
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem', maxWidth: '18rem' }}>
                        Don't worry — refreshing will fix it!
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: 'linear-gradient(to right, #25f4b6, #34d399)',
                            color: '#0a0f1e', fontWeight: 'bold', padding: '0.875rem 2rem',
                            borderRadius: '1rem', border: 'none', fontSize: '1rem', cursor: 'pointer',
                            boxShadow: '0 0 20px rgba(37,244,182,0.3)',
                        }}
                    >
                        🔄 Refresh App
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
