import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

vi.mock('@clerk/react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ isSignedIn: false, getToken: () => Promise.resolve(null), userId: null, orgId: null, orgRole: null }),
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  Show: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
}));

describe('App', () => {
  it('renderiza titulo principal', () => {
    render(<App />);
    expect(
      screen.getByText('Calculadora de Descuentos de Ley'),
    ).toBeInTheDocument();
  });

  it('renderiza configuracion inicial', () => {
    render(<App />);
    expect(
      screen.getByText('Configuración Inicial'),
    ).toBeInTheDocument();
  });

  it('renderiza selector de jornada', () => {
    render(<App />);
    expect(screen.getByText('Jornada Laboral')).toBeInTheDocument();
  });

  it('renderiza registro de horas', () => {
    render(<App />);
    expect(screen.getByText('Registro de Horas')).toBeInTheDocument();
  });

  it('renderiza seccion de incentivos', () => {
    render(<App />);
    expect(
      screen.getByText('Incentivos (bonos, comisiones, etc.)'),
    ).toBeInTheDocument();
  });
});
