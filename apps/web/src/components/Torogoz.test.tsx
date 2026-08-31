import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Torogoz } from './Torogoz';

describe('Torogoz', () => {
  it('renderiza un svg con animacion torogoz-float', () => {
    const { container } = render(<Torogoz />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('class')).toContain('torogoz-float');
  });

  it('respeta className personalizado', () => {
    const { container } = render(<Torogoz className="size-8" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('size-8');
    expect(svg?.getAttribute('class')).toContain('torogoz-float');
  });

  it('es decorativo (aria-hidden)', () => {
    const { container } = render(<Torogoz />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
