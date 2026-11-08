import { describe, expect, it } from 'vitest';
import { pyodideBaseUrl } from '../../src/engine/pyodideBase';

describe('pyodideBaseUrl', () => {
  it('serves Pyodide from the page origin', () => {
    expect(pyodideBaseUrl('/', 'https://ground-truth.example')).toBe('https://ground-truth.example/pyodide/');
  });

  it('respects a sub-path base', () => {
    expect(pyodideBaseUrl('/game/', 'http://localhost:5173')).toBe('http://localhost:5173/game/pyodide/');
    expect(pyodideBaseUrl('/game', 'http://localhost:5173')).toBe('http://localhost:5173/game/pyodide/');
  });
});
