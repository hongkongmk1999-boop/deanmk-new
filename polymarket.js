// Relays Polymarket's public soccer events so browsers never hit CORS limits.
exports.handler = async () => {
  const url = "https://gamma-api.polymarket.com/events?tag_slug=soccer&active=true&closed=false&limit=200&order=volume24hr&ascending=false";
  try {
    const r = await fetch(url);
    return {
      statusCode: r.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=15",
        "Netlify-CDN-Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
      },
      body: await r.text(),
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: e.message }) };
  }
};
