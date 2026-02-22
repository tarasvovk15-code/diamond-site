module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

 const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!chatId) {
  return res.status(500).json({ error: 'TELEGRAM_CHAT_ID not configured' });
}
  if (!token) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  }

  try {
    const { name, phone, message } = req.body;

    const text = [
      '📞 Нова заявка з сайту',
      '',
      `👤 Ім'я: ${name || '—'}`,
      `📱 Телефон: ${phone || '—'}`,
      message ? `💬 Повідомлення: ${message}` : ''
    ].filter(Boolean).join('\n');

    const resp = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      }
    );

    const data = await resp.json();

    if (!data.ok) {
      return res.status(400).json({ error: data.description || 'Telegram error' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


