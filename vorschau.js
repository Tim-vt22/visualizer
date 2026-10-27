// Passwortgeschützte Vorschau des Konfigurators für ConTec (Cloudflare Worker).
// Nur für die Abnahme. Die echte Seite läuft weiter über GitHub Pages (Branch main).
// Das Passwort steht nicht hier, sondern als Secret SITE_PASSWORT in Cloudflare.

export default {
  async fetch(request, env) {
    if (!env.SITE_PASSWORT) {
      return antwort("Vorschau noch nicht freigeschaltet: SITE_PASSWORT fehlt.", 503);
    }

    const auth = request.headers.get("Authorization") || "";
    if (auth.startsWith("Basic ")) {
      let eingabe = "";
      try {
        eingabe = atob(auth.slice(6)).split(":").slice(1).join(":");
      } catch {
        eingabe = "";
      }
      if (gleich(eingabe, env.SITE_PASSWORT)) {
        return mitNoindex(await env.ASSETS.fetch(request));
      }
    }

    return antwort("Zugang nur mit Passwort.", 401, {
      "WWW-Authenticate": 'Basic realm="ConTec Vorschau", charset="UTF-8"',
    });
  },
};

function mitNoindex(original) {
  const res = new Response(original.body, original);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function antwort(text, status, headers = {}) {
  return new Response(text, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      ...headers,
    },
  });
}

function gleich(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.byteLength !== y.byteLength) return false;
  return crypto.subtle.timingSafeEqual(x, y);
}
