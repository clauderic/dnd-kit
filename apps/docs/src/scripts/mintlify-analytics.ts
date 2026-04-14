/**
 * Lightweight Mintlify analytics client.
 *
 * Replicates the event pipeline of the standard Mintlify platform so that
 * page-view and interaction data appears in the Mintlify dashboard even when
 * using @mintlify/astro on a self-hosted deployment.
 *
 * Events are batched and sent to the Mintlify analytics proxy endpoint.
 */

const SUBDOMAIN = import.meta.env.PUBLIC_MINTLIFY_SUBDOMAIN;
const ENDPOINT =
  import.meta.env.PUBLIC_MINTLIFY_ANALYTICS_ENDPOINT ??
  `https://${SUBDOMAIN}.mintlify.app/_mintlify/api/v1/e`;

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5_000;

const ANON_ID_KEY = 'mintlify_anonymous_id';
const SESSION_ID_KEY = 'mintlify_session_id';

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreate(
  storage: Storage,
  key: string,
  prefix: string,
): string {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
  } catch {
    // storage unavailable
  }

  const id = generateId(prefix);

  try {
    storage.setItem(key, id);
  } catch {
    // storage unavailable
  }

  return id;
}

const anonId = getOrCreate(localStorage, ANON_ID_KEY, 'anon');
const sessionId = getOrCreate(sessionStorage, SESSION_ID_KEY, 'session');

// ---------------------------------------------------------------------------
// Event builder
// ---------------------------------------------------------------------------

interface AnalyticsEvent {
  event_id: string;
  subdomain: string;
  anon_id: string;
  session_id: string;
  event: string;
  created_at: string;
  path: string;
  referrer: string;
  user_agent: string;
  properties: Record<string, string>;
}

function buildEvent(
  eventName: string,
  extra: Record<string, string> = {},
): AnalyticsEvent {
  const properties: Record<string, string> = {
    ...extra,
    $current_url: location.href,
    $viewport_height: String(innerHeight),
    $viewport_width: String(innerWidth),
    $browser_language: navigator.language,
  };

  if (screen) {
    properties.$screen_height = String(screen.height);
    properties.$screen_width = String(screen.width);
  }

  try {
    properties.$timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // ignore
  }

  const search = location.search;
  if (search) properties.$current_url_search = search;

  const hash = location.hash;
  if (hash) properties.$current_url_hash = hash;

  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn?.effectiveType) {
      properties.$network_connection_type = conn.effectiveType;
    }
  }

  return {
    event_id: crypto.randomUUID(),
    subdomain: SUBDOMAIN,
    anon_id: anonId,
    session_id: sessionId,
    event: eventName,
    created_at: new Date().toISOString(),
    path: location.pathname,
    referrer: document.referrer,
    user_agent: navigator.userAgent,
    properties,
  };
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setInterval> | undefined;

function serializeBatch(events: AnalyticsEvent[]): string {
  return JSON.stringify({ events, timestamp: Date.now() });
}

function flush(): void {
  if (queue.length === 0) return;

  const batch = queue.splice(0, BATCH_SIZE);
  const body = serializeBatch(batch);

  // Prefer sendBeacon when the page is unloading; fall back to fetch.
  if (document.visibilityState === 'hidden' && navigator.sendBeacon) {
    navigator.sendBeacon(
      ENDPOINT,
      new Blob([body], { type: 'text/plain' }),
    );
  } else {
    fetch(ENDPOINT, {
      method: 'POST',
      body,
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      keepalive: true,
    }).catch(() => {
      // fire-and-forget — analytics failures are silent
    });
  }
}

function enqueue(event: AnalyticsEvent): void {
  queue.push(event);

  if (queue.length >= BATCH_SIZE) {
    flush();
  }
}

function startPeriodicFlush(): void {
  if (timer != null) return;
  timer = setInterval(flush, FLUSH_INTERVAL);
}

// ---------------------------------------------------------------------------
// Page lifecycle
// ---------------------------------------------------------------------------

function onUnload(): void {
  flush();
}

window.addEventListener('beforeunload', onUnload);
window.addEventListener('pagehide', onUnload);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Track a named event with optional extra properties.
 *
 * Event names follow the Mintlify convention: `docs.<noun>.<action>`
 * (e.g. `docs.search.query`, `docs.code_block.copy`).
 */
export function trackEvent(
  eventName: string,
  extra: Record<string, string> = {},
): void {
  enqueue(buildEvent(eventName, extra));
}

// Expose on window so React component islands can call it.
(window as any).__mintlifyTrackEvent = trackEvent;

// ---------------------------------------------------------------------------
// Auto-track page views on Astro navigation
// ---------------------------------------------------------------------------

function trackPageView(): void {
  trackEvent('docs.content.view', {
    subdomain: SUBDOMAIN,
    title: document.title,
  });
}

// `astro:page-load` fires on initial load and after every client-side
// navigation when the <ClientRouter> (View Transitions) is active.
document.addEventListener('astro:page-load', trackPageView);

startPeriodicFlush();
