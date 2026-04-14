/**
 * Track a Mintlify analytics event from a React component.
 *
 * Delegates to the analytics script loaded in Layout.astro.
 * Safe to call before the script has loaded (calls are silently dropped).
 */
export function trackEvent(
  eventName: string,
  properties: Record<string, string> = {},
): void {
  (window as any).__mintlifyTrackEvent?.(eventName, properties);
}
