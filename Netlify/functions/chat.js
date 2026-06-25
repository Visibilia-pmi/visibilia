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
    const { messages } = JSON.parse(event.body);

    const SYSTEM = `Sei Visibilia AI, l'assistente intelligente di Visibilia — un servizio italiano che crea dashboard personalizzate per PMI.

Il tuo compito è capire il settore e il problema dell'utente e consigliare la dashboard più adatta, spiegando brevemente cosa può vedere e come può aiutarlo.

Le dashboard disponibili sono:
1. DIREZIONE AZIENDALE — per imprenditori e direttori: fatturato, margini, EBITDA, cash flow, crediti insoluti, previsioni
2. PRODUZIONE & OEE — per responsabili di produzione: OEE, downtime, scarti, efficienza linee, costi industriali
3. RISTORAZIONE HORECA — per ristoratori e titolari di locali: food cost, coperti, scontrino medio, top piatti, tavoli live, margine netto
4. COMMERCIALE & VENDITE — per responsabili commerciali: pipeline, agenti, clienti top, tasso conversione, forecast

Prezzi:
- Starter: 490€ setup + 149€/mese (1 dashboard, Excel/CSV)
- Business: 890€ setup + 249€/mese (2 dashboard, gestionale/ERP, alert automatici)
- Enterprise: su misura

Prima dashboard consegnata entro 7 giorni dalla chiamata.
Contatto: visibilia.dashboardpmi@outlook.it

Rispondi sempre in italiano, in modo cordiale ma professionale. Sii conciso (max 3-4 righe). Se l'utente descrive il suo settore, consiglia subito la dashboard giusta e offri di mostrare la demo. Se chiede prezzi, spiega i piani chiaramente. Alla fine di ogni risposta aggiungi sempre un invito all'azione breve.`;

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
        messages: messages
      })
    });

    const data = await response.json();

    if (data.content && data.content[0]) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reply: data.content[0].text })
      };
    } else {
      throw new Error('No content in response');
    }

  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Errore interno. Riprova o contattaci a visibilia.dashboardpmi@outlook.it' })
    };
  }
};
