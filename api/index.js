const express = require('express');
const { getGoogleSheetClient } = require('./googleSheetsClient');
const { fetchData } = require('./fetchData');
const { fetchUsers } = require('./fetchUsers');
const { parseData } = require('./parseData');
const { fetchLatestCycleTime } = require('./fetchLatestCycleTime');
const { createDailySheet } = require('./createDailySheet');
const { updateTotalAdjustments } = require('./updateTotalAdjustments');
const { updateDailySheet } = require('./updateDailySheet');

const app = express();
const port = process.env.PORT || 3000;

app.get('/update-sheet', async (req, res) => {
  try {
    console.log('Request received');
    const data = await fetchData();
    const userMap = await fetchUsers();
    const adjustments = parseData(data, userMap);
    const latestCycleTime = await fetchLatestCycleTime();

    const sheets = await getGoogleSheetClient();
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const isNewSheet = await createDailySheet(sheets, date);
    await updateDailySheet(sheets, date, adjustments, latestCycleTime, isNewSheet);
    await updateTotalAdjustments(sheets, adjustments);

    console.log('All operations completed successfully');
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
