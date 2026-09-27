import { Component } from 'react';
import type { ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  /** FE-13: ID de soporte, no el mensaje del error (puede filtrar internos). */
  idSoporte: string;
}

function generarIdSoporte(): string {
  return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, idSoporte: '' };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, idSoporte: generarIdSoporte() };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Detalle técnico SOLO en consola del navegador (FE-13); la UI muestra
    // un mensaje genérico con ID de soporte, sin stack ni message interno.
    console.error('[ErrorBoundary]', info.componentStack, error);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="tool-card mx-auto max-w-md rounded-md border-danger/20 p-8 text-center"
          >
            <h2 className="text-lg font-bold text-danger">
              Algo salió mal
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Ocurrió un error inesperado. Tus datos guardados en este
              navegador no fueron afectados.
            </p>
            <p className="mt-2 text-xs text-text-muted">
              ID de soporte:{' '}
              <span className="amount font-mono">{this.state.idSoporte}</span>
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, idSoporte: '' });
              }}
              className="btn-accent mt-4 rounded-md px-4 py-2 text-sm"
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
