// Servisni delavec: omogoči namestitev aplikacije in hitrejši zagon.
// Stran se vedno najprej poskusi naložiti z interneta (da so spremembe takoj vidne); predpomnilnik je le rezerva.
// Podatki iz Supabase (drug naslov) se nikoli ne shranjujejo.
var CACHE = "preserje-v1";
var SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); })
    .then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;   // samo naša stran in ikone
  e.respondWith(fetch(req).then(function(res){
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
    return res;
  }).catch(function(){ return caches.match(req).then(function(m){ return m || caches.match("index.html"); }); }));
});
