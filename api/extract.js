export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing SCRAPINGBEE_API_KEY in environment' });
    return;
  }

  const scrapingUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true`;

  try {
    const response = await fetch(scrapingUrl);
    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `ScrapingBee error: ${text}` });
      return;
    }
    const html = await response.text();
    res.status(200).json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 