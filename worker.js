var CACHE_NAME = 'mobilepub-v3.0.0';
var BASE_DIR = '/mobilepub';

// The files we want to cache
var urlsToCache = [
  BASE_DIR + '/',
  BASE_DIR + '/css/style.css',
  BASE_DIR + '/lib/jquery.js',
  BASE_DIR + '/lib/handlebars.js',
  BASE_DIR + '/js/micropub.js',
  BASE_DIR + '/js/app.js'
];

// Set the callback for the install step
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request);
      }
    )
  );
});
