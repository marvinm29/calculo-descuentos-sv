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
            className="mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 p-6 text-center"
          >
            <h2 className="text-lg font-semibold text-red-800">
              Algo sali&oacute; mal
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {this.state.error?.message ??
                'Ocurri&oacute; un error inesperado.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
