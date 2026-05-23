const { google } = require('googleapis');

exports.handler = async (event, context) => {
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

  try {
    const { clientName, track, stepTitle, notes, fileUrl } = JSON.parse(event.body);
    
    // Secure: Reads directly from the Netlify Environment Variables screen!
    const apiKey = process.env.GOOGLE_API_KEY; 
    const spreadsheetId = process.env.SPREADSHEET_ID; 

    const sheets = google.sheets({ version: 'v4', auth: apiKey });

    const values = [
      [
        new Date().toISOString(), 
        clientName || 'Unnamed Client', 
        track ? track.toUpperCase() : 'LOGO', 
        stepTitle, 
        notes || '', 
        fileUrl || 'No Attachments',
        'COMPLETED'
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ message: 'Milestone row logged securely!' }),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message }) 
    };
  }
};