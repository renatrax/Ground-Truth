import { describe, expect, it } from 'vitest';
import { pyodideBaseUrl } from '../../src/engine/pyodideBase';

describe('pyodideBaseUrl', () => {
  it('resolves inside the desktop app on macOS and Linux', () => {
    expect(pyodideBaseUrl('/', 'tauri://localhost/index.html')).toBe('tauri://localhost/pyodide/');
  });

  it('resolves inside the desktop app on Windows', () => {
    expect(pyodideBaseUrl('/', 'http://tauri.localhost/')).toBe('http://tauri.localhost/pyodide/');
  });

  it('resolves on the dev server and respects a sub-path base', () => {
    expect(pyodideBaseUrl('/', 'http://localhost:5173/')).toBe('http://localhost:5173/pyodide/');
    expect(pyodideBaseUrl('/game', 'http://localhost:5173/game/')).toBe(
      'http://localhost:5173/game/pyodide/',
    );
  });
});
