const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { messages } = JSON.parse(event.body);

    const SYSTEM = `Sei Visibilia AI, l'assistente intelligente di Visibilia. Consiglia dashboard per PMI italiane. Dashboard disponibili: 1. DIREZIONE AZIENDALE 2. PRODUZIONE & OEE 3. RISTORAZIONE HORECA 4. COMMERCIALE & VENDITE. Prezzi: Starter 490 euro + 149 euro/mese, Business 890 euro + 249 euro/mese. Prima dashboard in 7 giorni. Email: visibilia.dashboardpmi@outlook.it. Rispondi in italiano, max 4 righe.`;

    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: SYSTEM,
      messages: messages
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(requestBody);
      req.end();
    });

    if (result.content && result.content[0]) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: result.content[0].text })
      };
    } else {
      throw new Error('No content');
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore. Contattaci: visibilia.dashboardpmi@outlook.it' })
    };
  }
};
