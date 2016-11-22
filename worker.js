var CACHE_NAME = 'inkstone-v1.0.5';
var BASE_DIR = '/inkstone';

// The files we want to cache
var urlsToCache = [
  BASE_DIR + '/',
  BASE_DIR + '/manifest.json',

 '/img/png/inkstone144.png',
 '/img/png/inkstone192.png',
 '/img/svg/inkstone.svg',
 '/img/svg/inkling.svg',

  BASE_DIR + '/scripts/app-bundle.js',
  BASE_DIR + '/scripts/app-bundle.js.map',
  BASE_DIR + '/scripts/require.js',
  BASE_DIR + '/scripts/text.js',
  BASE_DIR + '/scripts/vendor-bundle.js',

  BASE_DIR + '/icons/circle-icons/audio.svg',
  BASE_DIR + '/icons/circle-icons/bookmark.svg',
  BASE_DIR + '/icons/circle-icons/bubble.svg',
  BASE_DIR + '/icons/circle-icons/calendar.svg',
  BASE_DIR + '/icons/circle-icons/check.svg',
  BASE_DIR + '/icons/circle-icons/document.svg',
  BASE_DIR + '/icons/circle-icons/film.svg',
  BASE_DIR + '/icons/circle-icons/heart.svg',
  BASE_DIR + '/icons/circle-icons/lens.svg',
  BASE_DIR + '/icons/circle-icons/location.svg',
  BASE_DIR + '/icons/circle-icons/memcard.svg',
  BASE_DIR + '/icons/circle-icons/mic.svg',
  BASE_DIR + '/icons/circle-icons/pencil.svg',
  BASE_DIR + '/icons/circle-icons/person.svg',
  BASE_DIR + '/icons/circle-icons/photo.svg',
  BASE_DIR + '/icons/circle-icons/power.svg',
  BASE_DIR + '/icons/circle-icons/recycle.svg',
  BASE_DIR + '/icons/circle-icons/search.svg',
  BASE_DIR + '/icons/circle-icons/settings.svg',
  BASE_DIR + '/icons/circle-icons/uparrow.svg'

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

self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
            if(cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
            }
        })
      );
    })

  );
});


