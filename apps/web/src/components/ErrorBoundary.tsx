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
            className="mx-auto max-w-md rounded-lg border border-danger bg-danger-bg p-6 text-center"
          >
            <h2 className="text-lg font-semibold text-danger">
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
              className="mt-4 rounded bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger focus:ring-2 focus:ring-danger focus:outline-none"
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
