const { google } = require('googleapis');
const axios = require('axios');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.SHEET_ID;
const API_BASE_URL = process.env.API_BASE_URL;
const API_CHECKLISTS = process.env.API_CHECKLISTS;
const API_TOKEN = process.env.API_TOKEN; // Assume this is the x-api-key value

const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8'));

async function getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

async function fetchData() {
  const now = new Date();
  const answeredBefore = now.toISOString();
  const answeredAfter = new Date(now.getTime() - 60000).toISOString(); // 1 minute earlier

  const apiUrl = `${API_BASE_URL}?Checklists=${API_CHECKLISTS}&AnsweredBefore=${encodeURIComponent(answeredBefore)}&AnsweredAfter=${encodeURIComponent(answeredAfter)}`;

  console.log('Fetching data from API URL:', apiUrl);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-api-key': API_TOKEN,
      },
    });
    console.log('Data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.response ? error.response.data : error.message);
    throw new Error('Error fetching data');
  }
}

function parseData(data) {
  const adjustments = [];
  data.values.forEach(value => {
    if (value.answers) {
      adjustments.push({
        question: value.question,
        answer: parseInt(value.answers[0], 10), // Ensure the answer is treated as an integer
      });
    }
  });
  console.log('Parsed data:', adjustments);
  return adjustments;
}

async function createDailySheet(sheets, date) {
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: date,
              },
            },
          },
        ],
      },
    });
    console.log(`Sheet for ${date} created successfully`);
  } catch (error) {
    console.error(`Error creating sheet for ${date}:`, error);
    throw new Error(`Error creating sheet for ${date}`);
  }
}

async function updateDailySheet(sheets, date, adjustments) {
  const range = `${date}!A1`;

  const rows = adjustments.map(adjustment => [adjustment.question, adjustment.answer]);

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: rows,
      },
    });
    console.log(`Sheet for ${date} updated successfully`);
  } catch (error) {
    console.error(`Error updating sheet for ${date}:`, error);
    throw new Error(`Error updating sheet for ${date}`);
  }
}

async function updateTotalAdjustments(sheets, adjustments) {
  const totalRange = 'Total Adjustments!A1:B';
  
  try {
    // Read current totals
    const currentTotalsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: totalRange,
    });
    
    const currentTotals = currentTotalsResponse.data.values || [];
    const totalsMap = new Map(currentTotals.map(row => [row[0], parseInt(row[1], 10)]));

    // Update totals with today's adjustments
    adjustments.forEach(adjustment => {
      const currentTotal = totalsMap.get(adjustment.question) || 0;
      totalsMap.set(adjustment.question, currentTotal + adjustment.answer);
    });

    // Prepare the updated totals data
    const updatedTotals = Array.from(totalsMap.entries());

    // Write back the updated totals
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: totalRange,
      valueInputOption: 'RAW',
      resource: {
        values: updatedTotals,
      },
    });
    console.log('Total adjustments updated successfully');
  } catch (error) {
    console.error('Error updating total adjustments:', error);
    throw new Error('Error updating total adjustments');
  }
}

module.exports = async (req, res) => {
  try {
    console.log('Request received');
    const data = await fetchData();
    const adjustments = parseData(data);
    const sheets = await getGoogleSheetClient();
    
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    await createDailySheet(sheets, date);
    await updateDailySheet(sheets, date, adjustments);
    await updateTotalAdjustments(sheets, adjustments);

    console.log('All operations completed successfully');
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
