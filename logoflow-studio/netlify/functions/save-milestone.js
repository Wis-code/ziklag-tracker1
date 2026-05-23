const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // Handle cross-origin preflight requests safely (CORS)
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
    // 1. Parse the incoming form submission payload from the frontend
    const { clientName, track, stepTitle, notes, fileUrl } = JSON.parse(event.body);
    
    // 2. Core Server Credentials
    const apiKey = 'AIzaSyB43DJcnasDHI42ShePQDRx_r6Sp_xN1kM'; 
    const spreadsheetId = '1rRJ4jfzLMSI2NPGt-3fO_zHOA2VWqw2cRKHhzruwJj8'; 

    const sheets = google.sheets({ version: 'v4', auth: apiKey });

    // 3. Map the fields precisely to match your clean camelCase Sheet headings 
    // This perfectly matches columns A through G in your live layout
    const values = [
      [
        new Date().toISOString(),            // Column A: timestamp
        clientName || 'Unnamed Client Instance', // Column B: clientIdentifier
        track ? track.toUpperCase() : 'N/A',   // Column C: tracking
        stepTitle || 'No Title Set',          // Column D: milestoneTitle
        notes || '',                          // Column E: notesIdeas
        fileUrl || 'No Attachments Saved',    // Column F: assetLink
        'COMPLETED'                           // Column G: status
      ]
    ];

    // 4. Append payload row down to the Google Sheet database
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