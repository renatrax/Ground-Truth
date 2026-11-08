/**
 * Absolute URL of the bundled Pyodide folder, e.g. "tauri://localhost/pyodide/".
 * Resolved against the page URL rather than `location.origin`, because the
 * desktop app's custom schemes (tauri://, http://tauri.localhost) don't all
 * have a usable origin.
 * `baseUrl` is Vite's BASE_URL ("/" by default); `pageHref` is location.href.
 */
export function pyodideBaseUrl(baseUrl: string, pageHref: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(`${base}pyodide/`, pageHref).href;
}
