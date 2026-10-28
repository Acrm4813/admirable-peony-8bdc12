// Stock/ETF quotes via Finnhub. The API key stays on the server.
// Env vars (Netlify > Site settings > Environment variables):
//   FINNHUB_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
exports.handler = async (event) => {
  const json = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=30" }, body: JSON.stringify(obj) });
  const { FINNHUB_API_KEY: key, SUPABASE_URL: sbUrl, SUPABASE_ANON_KEY: sbKey } = process.env;
  if (!key || !sbUrl || !sbKey) return json(500, { error: "Server not configured" });
  // Only signed-in users may use the proxy
  const auth = event.headers.authorization || event.headers.Authorization || "";
  const who = await fetch(sbUrl + "/auth/v1/user", { headers: { apikey: sbKey, Authorization: auth } });
  if (!who.ok) return json(401, { error: "Sign in required" });
  const syms = ((event.queryStringParameters || {}).symbols || "").split(",")
    .map(s => s.trim().toUpperCase()).filter(s => /^[A-Z.\-]{1,10}$/.test(s)).slice(0, 20);
  const out = {};
  await Promise.all(syms.map(async (s) => {
    try {
      const r = await fetch("https://finnhub.io/api/v1/quote?symbol=" + s + "&token=" + key);
      const q = await r.json();
      if (q && q.c) out[s] = { price: q.c, change: q.dp };
    } catch (e) {}
  }));
  return json(200, out);
};
