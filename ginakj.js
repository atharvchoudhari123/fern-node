// Fern service worker: Scramjet-only request routing with a configurable
// destination blocklist. The policy is served by the Node app from .env.
const swBase = self.location.pathname.replace(/ginakj\.js$/, '');

importScripts(swBase + 'assets/djm/zhfh.bundle.js');
importScripts(swBase + 'xttc/eakd.all.js');

let scramjet = null;
let scramjetInitialized = false;
let initializationPromise = null;
let policyCache = null;
let policyFetchedAt = 0;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function getScramjet() {
  if (!scramjet) {
    const { ScramjetServiceWorker } = $scramjetLoadWorker();
    scramjet = new ScramjetServiceWorker();
  }
  return scramjet;
}

async function initializeScramjet() {
  if (scramjetInitialized) return;
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const engine = await getScramjet();
      await engine.loadConfig();
      scramjetInitialized = true;
    })().finally(() => {
      if (!scramjetInitialized) initializationPromise = null;
    });
  }
  await initializationPromise;
}

async function getPolicy() {
  // Refresh periodically so a deployment's policy changes take effect without
  // requiring users to clear their service-worker cache.
  if (policyCache && Date.now() - policyFetchedAt < 60_000) return policyCache;
  const response = await fetch(swBase + 'api/proxy-policy', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load proxy blocklist policy');
  const policy = await response.json();
  if (!Array.isArray(policy.blockedDomains) || typeof policy.blockSubdomains !== 'boolean') {
    throw new Error('Invalid proxy blocklist policy');
  }
  policyCache = policy;
  policyFetchedAt = Date.now();
  return policy;
}

function getDestinationFromProxyPath(pathname) {
  const routeStart = pathname.indexOf(swBase + 'gqqn/');
  if (routeStart === -1) return null;

  // Fern's Scramjet v1 route stores an encoded HTTP(S) URL in the path.
  // Search after the route prefix because deployments may include frame IDs.
  const routePart = pathname.slice(routeStart + (swBase + 'gqqn/').length);
  const encodedUrlMatch = routePart.match(/https?%3a%2f%2f/i);
  const plainUrlMatch = routePart.match(/https?:\/\//i);
  const match = encodedUrlMatch || plainUrlMatch;
  if (!match) return null;

  const raw = routePart.slice(match.index);
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }

  const urlMatch = decoded.match(/https?:\/\/[^\s"'<>]+/i);
  if (!urlMatch) return null;
  try {
    const destination = new URL(urlMatch[0]);
    if (destination.protocol !== 'http:' && destination.protocol !== 'https:') return null;
    return destination;
  } catch {
    return null;
  }
}

function isBlocked(hostname, policy) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return policy.blockedDomains.some((domain) => {
    const normalized = domain.toLowerCase().replace(/\.$/, '');
    return host === normalized || (policy.blockSubdomains && host.endsWith('.' + normalized));
  });
}

async function handleScramjetRequest(event) {
  try {
    const policy = await getPolicy();
    const destination = getDestinationFromProxyPath(new URL(event.request.url).pathname);

    // Fail closed if a request is on Fern's proxy route but its destination
    // cannot be decoded; otherwise an unfamiliar URL encoding could skip checks.
    if (!destination) {
      return new Response('Blocked: unable to validate proxy destination.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    if (isBlocked(destination.hostname, policy)) {
      return new Response('This destination is blocked by the Fern domain blocklist.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const engine = await getScramjet();
    await initializeScramjet();
    if (engine.route(event)) return await engine.fetch(event);
    return fetch(event.request);
  } catch (error) {
    console.error('Scramjet request failed:', error);
    return new Response('Scramjet could not handle this request. Check the engine configuration and worker assets.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith(swBase + 'gqqn/')) {
    event.respondWith(handleScramjetRequest(event));
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data.json(); } catch {}
  event.waitUntil(self.registration.showNotification(data.title || 'Fern', {
    body: data.body || '',
    icon: data.icon,
    data: { url: data.url || '/chat' },
    tag: data.tag
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/chat';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      if ('focus' in client) {
        if (client.navigate) client.navigate(url);
        return client.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
