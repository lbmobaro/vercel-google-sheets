const googleSheetsClient = require('./googleSheetsClient');
const fetchData = require('./fetchData');
const fetchUsers = require('./fetchUsers');
const fetchLatestCycleTime = require('./fetchLatestCycleTime');
const parseData = require('./parseData');
const createDailySheet = require('./createDailySheet');
const updateDailySheet = require('./updateDailySheet');
const updateTotalAdjustments = require('./updateTotalAdjustments');

async function runUpdates() {
  console.log('Request received');
  
  // Fetch data
  const data = await fetchData();
  
  // Fetch user data
  const userMap = await fetchUsers();
  
  // Parse data
  const adjustments = parseData(data, userMap);
  
  // Fetch the latest cycle time
  const latestCycleTime = await fetchLatestCycleTime();

  // Get Google Sheets client
  const sheets = await googleSheetsClient();
  
  const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  // Create or get daily sheet
  const isNewSheet = await createDailySheet(sheets, date);
  
  // Update daily sheet
  await updateDailySheet(sheets, date, adjustments, isNewSheet);
  
  // Update total adjustments
  await updateTotalAdjustments(sheets, adjustments);

  console.log('All operations completed successfully');
}

module.exports = { runUpdates };
