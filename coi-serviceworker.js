/*
  coi-serviceworker.js
  Treehouse Kids Academy Lesson Planner.

  GitHub Pages cannot send the two security headers that let the browser use several
  processor cores for the on-device AI. This small file adds them. Put it in the same
  folder as index.html. If it is missing or the browser does not support it, the planner
  still works; the AI is just slower (it uses one core).
*/
if (typeof window === "undefined") {
  // Service worker side: add the headers to this site's own pages and files.
  self.addEventListener("install", function () { self.skipWaiting(); });
  self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
  self.addEventListener("fetch", function (e) {
    var r = e.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;
    if (new URL(r.url).origin !== self.location.origin) return; // leave downloads from other sites alone
    e.respondWith(
      fetch(r).then(function (res) {
        if (!res || res.status === 0) return res;
        var h = new Headers(res.headers);
        h.set("Cross-Origin-Embedder-Policy", "require-corp");
        h.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
      }).catch(function () { return fetch(r); })
    );
  });
} else {
  // Page side: register once, then reload once so the headers take effect.
  (function () {
    try {
      if (window.crossOriginIsolated) return;
      if (!window.isSecureContext || !("serviceWorker" in navigator)) return;
      var src = document.currentScript && document.currentScript.src;
      if (!src) return;
      navigator.serviceWorker.register(src).then(function (reg) {
        var done = false;
        try { done = sessionStorage.getItem("tka-coi") === "1"; } catch (e) {}
        if (!done && (reg.active || reg.installing || reg.waiting)) {
          var go = function () { try { sessionStorage.setItem("tka-coi", "1"); } catch (e) {} location.reload(); };
          if (reg.active && navigator.serviceWorker.controller) return;
          if (reg.active) go();
          else navigator.serviceWorker.addEventListener("controllerchange", go, { once: true });
        }
      }).catch(function () {});
    } catch (e) {}
  })();
}
