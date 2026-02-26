export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [
          { role: 'system', content: body.system },
          ...body.messages
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(200).json({ content: [{ text: JSON.stringify(data) }] });
    }

    res.status(200).json({ content: [{ text }] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
