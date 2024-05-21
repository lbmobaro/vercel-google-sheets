const { getLastRowNumber } = require('./getLastRowNumber');

async function updateDailySheet(sheets, date, adjustments, isNewSheet, latestCycleTime) {
  const rows = adjustments.map(adjustment => [
    adjustment.train,
    adjustment.carName,
    adjustment.adjustment,
    adjustment.time,
    adjustment.user,
    latestCycleTime // Add the latest cycle time to each row
  ]);

  const startRow = isNewSheet ? 2 : await getLastRowNumber(sheets, date) + 1;
  const range = `${date}!A${startRow}:F${startRow + rows.length - 1}`; // Adjust the range to include the new column
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

module.exports = { updateDailySheet };
