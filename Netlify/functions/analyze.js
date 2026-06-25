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
    const { csvData, fileName } = JSON.parse(event.body);

    const SYSTEM = `Sei Visibilia AI, analista aziendale esperto. Analizzi dati aziendali CSV/Excel e dai insights immediati in italiano. Struttura risposta: ## Cosa ho trovato ## Punti chiave ## Dashboard consigliata ## Azioni immediate. Dashboard disponibili: Direzione Aziendale, Produzione & OEE, Ristorazione HORECA, Commerciale & Vendite. Sii specifico con i numeri. Max 250 parole.`;

    const userMessage = `File: "${fileName}"\n\nDati:\n${csvData.substring(0, 6000)}`;

    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMessage }]
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
        body: JSON.stringify({ analysis: result.content[0].text })
      };
    } else {
      throw new Error('No content');
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore analisi. Contattaci: visibilia.dashboardpmi@outlook.it' })
    };
  }
};
