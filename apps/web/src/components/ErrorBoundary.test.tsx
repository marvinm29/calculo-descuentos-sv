import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('test error');
  }
  return <p>Todo bien</p>;
}

describe('ErrorBoundary', () => {
  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('muestra fallback cuando un hijo lanza error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/test error/)).toBeInTheDocument();

    vi.mocked(console.error).mockRestore();
  });

  it('el boton Reintentar resetea el estado de error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    await user.click(screen.getByText('Reintentar'));

    expect(screen.getByText('Todo bien')).toBeInTheDocument();

    vi.mocked(console.error).mockRestore();
  });

  it('usa fallback personalizado si se provee', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();

    vi.mocked(console.error).mockRestore();
  });
});
