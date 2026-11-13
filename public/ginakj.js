// Fern service worker: Scramjet-only request routing.
const swBase = self.location.pathname.replace(/ginakj\.js$/, '');

// This bundle contains the shared browser transport used by the existing
// Scramjet frontend. Ultraviolet is deliberately not initialized here.
importScripts(swBase + 'assets/djm/zhfh.bundle.js');
importScripts(swBase + 'xttc/eakd.all.js');

let scramjet = null;
let scramjetInitialized = false;
let initializationPromise = null;

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

async function handleScramjetRequest(event) {
  try {
    const engine = await getScramjet();
    await initializeScramjet();

    if (engine.route(event)) {
      return await engine.fetch(event);
    }
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

// Web Push (community chat notifications).
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fern', {
      body: data.body || '',
      icon: data.icon,
      data: { url: data.url || '/chat' },
      tag: data.tag
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/chat';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if (client.navigate) client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
