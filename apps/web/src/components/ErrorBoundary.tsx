import { Component } from 'react';
import type { ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="glass-card mx-auto max-w-md rounded-2xl border-danger/20 p-8 text-center"
          >
            <h2 className="text-lg font-bold text-danger">
              Algo salió mal
            </h2>
            <p className="mt-2 text-sm text-danger">
              {this.state.error?.message ??
                'Ocurrió un error inesperado.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="btn-accent mt-4 rounded-xl px-4 py-2 text-sm"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
