// Basic Service Worker for PWA compliance
const CACHE_NAME = 'nexus-v1';

self.addEventListener('install', (event) => {
  console.log('[Nexus SW] Installing Service Worker...');
});

self.addEventListener('activate', (event) => {
  console.log('[Nexus SW] Service Worker Activated');
});

self.addEventListener('fetch', (event) => {
  // Pass-through for now, required for PWA "Install" criteria
  event.respondWith(fetch(event.request));
});
