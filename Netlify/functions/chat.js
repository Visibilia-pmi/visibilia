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

    const SYSTEM = `Sei Visibilia AI, l'assistente intelligente di Visibilia — un servizio italiano che crea dashboard personalizzate per PMI. Il tuo compito è capire il settore e il problema dell'utente e consigliare la dashboard più adatta. Le dashboard disponibili: 1. DIREZIONE AZIENDALE — fatturato, margini, EBITDA, cash flow, crediti insoluti 2. PRODUZIONE & OEE — OEE, downtime, scarti, efficienza linee, costi industriali 3. RIS​​​​​​​​​​​​​​​​
