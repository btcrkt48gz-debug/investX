/**
 * Minimal API client — only used for unauthenticated endpoints like /api/prices.
 * All user data is now stored in Firebase Firestore.
 */
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, options);
}
