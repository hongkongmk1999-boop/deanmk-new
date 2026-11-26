// Relays a fixed list of API-Football endpoints. The key lives in the
// API_FOOTBALL_KEY environment variable and is never sent to the browser.
const ALLOWED = ["players", "players/topscorers", "players/topassists"];
const PARAMS = ["league", "season", "search", "page"];

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return json(500, { errors: ["API_FOOTBALL_KEY is not set on the server."] });
  if (!ALLOWED.includes(q.endpoint)) return json(400, { errors: ["Endpoint not allowed."] });

  const url = new URL("https://v3.football.api-sports.io/" + q.endpoint);
  for (const p of PARAMS) if (q[p]) url.searchParams.set(p, String(q[p]).slice(0, 60));

  try {
    const r = await fetch(url, { headers: { "x-apisports-key": key } });
    const body = await r.text();
    return {
      statusCode: r.status,
      headers: {
        "Content-Type": "application/json",
        // cache for an hour so the free 100/day quota stretches across visitors
        "Cache-Control": "public, max-age=300",
        "Netlify-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
      body,
    };
  } catch (e) {
    return json(502, { errors: ["Upstream error: " + e.message] });
  }
};
const json = (statusCode, obj) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
