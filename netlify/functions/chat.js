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

    const SYSTEM = `Sei Visibilia AI, l'assistente intelligente di Visibilia. Consiglia dashboard per PMI italiane. Dashboard disponibili: 1. DIREZIONE AZIENDALE 2. PRODUZIONE & OEE 3. RISTORAZIONE HORECA 4. COMMERCIALE & VENDITE. Prezzi: Starter 490 euro​​​​​​​​​​​​​​​​
