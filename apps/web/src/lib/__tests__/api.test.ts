import { describe, it, expect } from 'vitest';
import { getApiUrl } from '../api';

describe('api', () => {
  it('getApiUrl retorna la URL configurada', () => {
    expect(getApiUrl()).toBe('http://localhost:3001');
  });
});
