import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import * as Sentry from '@sentry/react';
import { App } from './App';
import './index.css';

const env = import.meta.env as Record<string, string>;
const PUBLISHABLE_KEY: string = env['VITE_CLERK_PUBLISHABLE_KEY'] ?? '';
const SENTRY_DSN: string = env['VITE_SENTRY_DSN'] ?? '';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: env['VITE_ENV'] ?? 'development',
  });
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
