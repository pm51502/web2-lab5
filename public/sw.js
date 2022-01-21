const staticCacheName = 'site-static-v98';
const assets = [
  '/',
  'index.html',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
  'assets/css/site.css',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
  'assets/pages/fallback.html',
  'assets/pages/404.html',
  'assets/pages/geo.html',
  'assets/pages/addFact.html',
  'assets/img/icon-96x96.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
];

self.addEventListener('install', evt => {
  console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', evt => {
  console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
      caches.match(evt.request).then(res => {
                if(res) {
                  console.log(`Found ${evt.request.url} in cache!`);
                  return res;
                } else {
                  return fetch(evt.request).then(fetchRes => {
                      console.log(`response.status = ${fetchRes.status}`);
                      if(fetchRes.status === 404) {
                        return caches.match('assets/pages/404.html');
                      } 
                      return fetchRes;
                  }).catch(error => {
                    console.log('error');
                  });
                }
            })
            .catch(error => {
                console.log('error');
                return caches.match('assets/pages/offline.html');
            })
  );
});

import { del, entries } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

self.addEventListener('sync', evt => {
  console.log('sync event');
  if (evt.tag === 'sync-facts') {
    evt.waitUntil(
      syncFacts()
    );
  }
});

async function syncFacts() {
  entries().then(entries => {
    entries.forEach(entry => {
      var id = entry[0];
      var fact = entry[1];

      fact.id = id;
      fetch('/api/facts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fact)
      }).then(res => {
        if(res.ok) {
          res.json().then(data => {
            console.log(`RES DATA: ${data}`);
            console.log(`deleting from idb: ${data.id}`);
            del(data.id);
          });
        }
      }).catch(function (error) {
          console.log(error);
        });
    });
  });
}

self.addEventListener('push', evt => {
  console.log('push event');

  var data = { title: "title", body: "body", redirectUrl: "/" };

  if(evt.data) {
    data = JSON.parse(evt.data.text());
  }

  var options = {
    body: data.body,
    icon: "./assets/img/icon-96x96.png",
    badge: "./assets/img/icon-96x96.png",
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: {
        redirectUrl: data.redirectUrl,
    },
  };

  evt.waitUntil(self.registration.showNotification(data.title, options));
});
