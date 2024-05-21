async function updateDailySheet(sheets, date, adjustments, latestCycleTime, isNewSheet) {
  const rows = adjustments.map(adjustment => [adjustment.train, adjustment.carName, adjustment.adjustment, adjustment.time, adjustment.user, latestCycleTime]);

  const startRow = isNewSheet ? 2 : await getLastRowNumber(sheets, date) + 1;
  const range = `${date}!A${startRow}:F${startRow + rows.length - 1}`; // Updated to F to include "Latest Cycle Time"
  const values = rows;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
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
      spreadsheetId: process.env.SHEET_ID,
      range: `${sheetName}!A:A`,
    });
    const numRows = response.data.values ? response.data.values.length : 0;
    return numRows;
  } catch (error) {
    console.error(`Error getting last row number for sheet "${sheetName}":`, error);
    throw new Error(`Error getting last row number for sheet "${sheetName}"`);
  }
}

module.exports = updateDailySheet;
