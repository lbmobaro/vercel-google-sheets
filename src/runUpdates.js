const { fetchData } = require('./fetchData');
const { fetchUsers } = require('./fetchUsers');
const { parseData } = require('./parseData');
const { createDailySheet } = require('./createDailySheet');
const { updateDailySheet } = require('./updateDailySheet');
const { updateTotalAdjustments } = require('./updateTotalAdjustments');
const { getGoogleSheetClient } = require('./googleSheetsClient');

async function runUpdates() {
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
  } catch (error) {
    console.error('Internal Server Error:', error);
    throw new Error('Internal Server Error');
  }
}

module.exports = { runUpdates };
