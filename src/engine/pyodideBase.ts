/**
 * Absolute URL of the self-hosted Pyodide folder, e.g. "https://host/app/pyodide/".
 * `baseUrl` is Vite's BASE_URL ("/" by default); `origin` is the page origin.
 */
export function pyodideBaseUrl(baseUrl: string, origin: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(`${base}pyodide/`, origin).href;
}
