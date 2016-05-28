var CACHE_NAME = 'mobilepub-v3.0.1';
var BASE_DIR = '/mobilepub';

// The files we want to cache
var urlsToCache = [
  BASE_DIR + '/',
  BASE_DIR + '/css/style.css',
  BASE_DIR + '/lib/jquery.js',
  BASE_DIR + '/lib/handlebars.js',
  BASE_DIR + '/js/micropub.js',
  BASE_DIR + '/js/app.js',
  BASE_DIR + '/svg/bookmark.png',
  BASE_DIR + '/svg/bubble.png',
  BASE_DIR + '/svg/bubbles.png',
  BASE_DIR + '/svg/camera.png',
  BASE_DIR + '/svg/daycalendar.png',
  BASE_DIR + '/svg/film.png',
  BASE_DIR + '/svg/gear.png',
  BASE_DIR + '/svg/heart.png',
  BASE_DIR + '/svg/home.png',
  BASE_DIR + '/svg/marker.png',
  BASE_DIR + '/svg/microphone.png',
  BASE_DIR + '/svg/power.png',
  BASE_DIR + '/svg/quote.png',
  BASE_DIR + '/svg/reload.png'
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
