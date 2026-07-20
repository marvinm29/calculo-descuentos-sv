import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('@clerk/react', () => {
  const MockShow = vi.fn(
    ({ when, children }: { when: string; children: React.ReactNode }) => {
      if (when === 'signed-out') return children;
      return null;
    },
  );

  return {
    ClerkProvider: vi.fn(({ children }: { children: React.ReactNode }) => children),
    useAuth: vi.fn(() => ({
      isLoaded: true,
      isSignedIn: false,
      userId: undefined,
      getToken: vi.fn(() => Promise.resolve(null)),
      signOut: vi.fn(),
    })),
    useUser: vi.fn(() => ({ isLoaded: true, isSignedIn: false, user: null })),
    Show: MockShow,
    SignInButton: vi.fn(({ children }: { children: React.ReactNode }) => children),
    SignUpButton: vi.fn(({ children }: { children: React.ReactNode }) => children),
    UserButton: vi.fn(() => null),
  };
});
