const { google } = require('googleapis');
const axios = require('axios');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.SHEET_ID;
const API_BASE_URL = process.env.API_BASE_URL;
const API_CHECKLISTS = process.env.API_CHECKLISTS;
const API_USER_GROUP = process.env.API_USER_GROUP;
const API_TOKEN = process.env.API_TOKEN; // Assume this is the x-api-key value

const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8'));

// Mapping of element IDs to car names and sides
const carNames = {
  'elements/2691957-C': 'RIGHT SIDE Pilot Car',
  'elements/2691958-C': 'RIGHT SIDE Car #1',
  'elements/2691959-C': 'RIGHT SIDE Car #2',
  'elements/2691960-C': 'RIGHT SIDE Car #3',
  'elements/2691961-C': 'RIGHT SIDE Car #4',
  'elements/2691962-C': 'RIGHT SIDE Car #5',
  'elements/2691963-C': 'RIGHT SIDE Car #6',
  'elements/2691964-C': 'RIGHT SIDE Car #7',
  'elements/2691965-C': 'RIGHT SIDE Car #8',
  'elements/2692011-C': 'LEFT SIDE Pilot Car',
  'elements/2692012-C': 'LEFT SIDE Car #1',
  'elements/2692013-C': 'LEFT SIDE Car #2',
  'elements/2692014-C': 'LEFT SIDE Car #3',
  'elements/2692015-C': 'LEFT SIDE Car #4',
  'elements/2692016-C': 'LEFT SIDE Car #5',
  'elements/2692017-C': 'LEFT SIDE Car #6',
  'elements/2692018-C': 'LEFT SIDE Car #7',
  'elements/2692019-C': 'LEFT SIDE Car #8',
};

const adjustmentValues = {
  '-1': 'Loosened',
  '0': 'Unadjusted',
  '1': 'Tightened'
};

const assetNames = {
  'assets/12125-A': 'Train 1',
  'assets/12130-A': 'Train 2'
};

async function getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  console.log('Authenticated with service account:', credentials.client_email); // Log the service account email
  return google.sheets({ version: 'v4', auth: authClient });
}

async function fetchData() {
  const now = new Date();
  const answeredBefore = now.toISOString();
  const answeredAfter = new Date(now.getTime() - 60000).toISOString(); // 1 minute earlier

  const apiUrl = `${API_BASE_URL}/results?Checklists=${API_CHECKLISTS}&AnsweredBefore=${encodeURIComponent(answeredBefore)}&AnsweredAfter=${encodeURIComponent(answeredAfter)}`;

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

async function fetchUsers() {
  const apiUrl = `${API_BASE_URL}/usergroups%2F${API_USER_GROUP}`;

  console.log('Fetching user data from API URL:', apiUrl);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-api-key': API_TOKEN,
      },
    });
    const users = response.data.users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {});
    console.log('User data fetched successfully:', users);
    return users;
  } catch (error) {
    console.error('Error fetching user data:', error.response ? error.response.data : error.message);
    throw new Error('Error fetching user data');
  }
}

function parseData(data, userMap) {
  const adjustments = [];
  if (data.items && data.items.length > 0) {
    const asset = data.items[0].asset;
    const train = assetNames[asset] || 'Unknown Train';
    data.items.forEach(item => {
      if (item.values && item.values.length > 0) {
        item.values.forEach(value => {
          if (value.answers) {
            adjustments.push({
              train,
              carName: carNames[value.question],
              adjustment: adjustmentValues[value.answers[0]],
              time: value.answered,
              user: userMap[item.user] || item.user
            });
          }
        });
      }
    });
  }
  console.log('Parsed data:', adjustments);
  return adjustments;
}

async function createSheetIfNotExists(sheets, sheetName) {
  try {
    const sheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    const sheetExists = sheetResponse.data.sheets.some(sheet => sheet.properties.title === sheetName);

    if (!sheetExists) {
      const requests = [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ];

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        resource: { requests },
      });

      console.log(`Sheet "${sheetName}" created successfully`);
    } else {
      console.log(`Sheet "${sheetName}" already exists`);
    }
    return !sheetExists;
  } catch (error) {
    console.error(`Error checking/creating sheet "${sheetName}":`, error);
    throw new Error(`Error checking/creating sheet "${sheetName}"`);
  }
}

async function createDailySheet(sheets, date) {
  const isNewSheet = await createSheetIfNotExists(sheets, date);
  if (isNewSheet) {
    const sheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    const sheetId = sheetResponse.data.sheets.find(sheet => sheet.properties.title === date).properties.sheetId;

    const requests = [
      {
        updateCells: {
          range: {
            sheetId,
            startRowIndex: 0,
            startColumnIndex: 0,
            endRowIndex: 1,
            endColumnIndex: 5,
          },
          rows: [
            {
              values: [
                { userEnteredValue: { stringValue: "Train" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Car Name" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Adjustment" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Time" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Adjusted by" }, userEnteredFormat: { textFormat: { bold: true } } },
              ],
            },
          ],
          fields: "userEnteredValue,userEnteredFormat.textFormat.bold",
        },
      },
      {
        addFilterView: {
          filter: {
            title: "Filter",
            range: {
              sheetId,
              startRowIndex: 0,
              startColumnIndex: 0,
              endRowIndex: 1,
              endColumnIndex: 5,
            },
          },
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      resource: { requests },
    });

    console.log(`Sheet "${date}" formatted successfully`);
  }
  return isNewSheet;
}

async function updateDailySheet(sheets, date, adjustments, isNewSheet) {
  const rows = adjustments.map(adjustment => [adjustment.train, adjustment.carName, adjustment.adjustment, adjustment.time, adjustment.user]);

  const startRow = isNewSheet ? 2 : await getLastRowNumber(sheets, date) + 1;
  const range = `${date}!A${startRow}:E${startRow + rows.length - 1}`;
  const values = rows;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource: {
        values,
      },
    });
    console.log(`Sheet for ${date} updated successfully`);
  } catch (error) {
    console.error(`Error updating sheet for ${date}:`, error);
    throw new Error(`Error updating sheet for ${date}`);
  }
}

async function getLastRowNumber(sheets, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:A`,
    });
    const numRows = response.data.values ? response.data.values.length : 0;
    return numRows;
  } catch (error) {
    console.error(`Error getting last row number for sheet "${sheetName}":`, error);
    throw new Error(`Error getting last row number for sheet "${sheetName}"`);
  }
}

async function updateTotalAdjustments(sheets, adjustments) {
  const sheetName = 'Total Adjustments';
  await createSheetIfNotExists(sheets, sheetName);

  const totalRange = `${sheetName}!A1:B`;
  
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
      const currentTotal = totalsMap.get(adjustment.carName) || 0;
      totalsMap.set(adjustment.carName, currentTotal + (adjustment.adjustment === 'Tightened' ? 1 : adjustment.adjustment === 'Loosened' ? -1 : 0));
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
    const userMap = await fetchUsers();
    const adjustments = parseData(data, userMap);
    const sheets = await getGoogleSheetClient();
    
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const isNewSheet = await createDailySheet(sheets, date);
    await updateDailySheet(sheets, date, adjustments, isNewSheet);
    await updateTotalAdjustments(sheets, adjustments);

    console.log('All operations completed successfully');
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
