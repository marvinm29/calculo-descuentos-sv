import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MonumentoSalvador } from './MonumentoSalvador';

describe('MonumentoSalvador', () => {
  it('renderiza un svg con animacion monumento-trazo', () => {
    const { container } = render(<MonumentoSalvador />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('class')).toContain('monumento-trazo');
  });

  it('respeta className personalizado', () => {
    const { container } = render(<MonumentoSalvador className="size-12" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('size-12');
  });

  it('es decorativo (aria-hidden)', () => {
    const { container } = render(<MonumentoSalvador />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
