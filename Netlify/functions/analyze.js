exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { csvData, fileName } = JSON.parse(event.body);

    const SYSTEM = `Sei Visibilia AI, un analista aziendale esperto italiano. 
Analizzi dati aziendali caricati dall'utente in formato CSV/Excel e fornisci insights immediati.

Il tuo obiettivo è:
1. Capire di che tipo di dati si tratta (vendite, produzione, costi, ecc.)
2. Identificare i punti chiave — trend, anomalie, opportunità
3. Consigliare quale dashboard Visibilia sarebbe più utile per questo tipo di dati
4. Suggerire 2-3 azioni concrete basate sui dati

Le dashboard disponibili:
- DIREZIONE AZIENDALE: fatturato, margini, cash flow, EBITDA
- PRODUZIONE & OEE: efficienza, downtime, scarti, costi industriali  
- RISTORAZIONE HORECA: food cost, coperti, margini, top piatti
- COMMERCIALE & VENDITE: pipeline, agenti, clienti, forecast

Rispondi in italiano con tono professionale ma accessibile.
Struttura la risposta con:
## 📊 Cosa ho trovato nei tuoi dati
## 💡 Punti chiave
## 🎯 Dashboard consigliata
## ✅ Azioni immediate

Sii specifico con i numeri che vedi. Max 300 parole.`;

    const userMessage = `Ho caricato un file chiamato "${fileName}". Ecco i dati in formato CSV:\n\n${csvData.substring(0, 8000)}\n\nAnalizza questi dati e dimmi cosa vedi.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await response.json();

    if (data.content && data.content[0]) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ analysis: data.content[0].text })
      };
    } else {
      throw new Error('No content in response');
    }

  } catch (error) {
    console.error('Analyze error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore analisi. Riprova o contattaci a visibilia.dashboardpmi@outlook.it' })
    };
  }
};
