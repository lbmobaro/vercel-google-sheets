// updateTotalAdjustments.js
const createSheetIfNotExists = require('./createSheetIfNotExists');

async function updateTotalAdjustments(sheets, adjustments) {
  const sheetName = 'Total Adjustments';
  await createSheetIfNotExists(sheets, sheetName);

  const totalRange = `${sheetName}!A1:B`;

  try {
    // Read current totals
    const currentTotalsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
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
      spreadsheetId: process.env.SHEET_ID,
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

module.exports = updateTotalAdjustments;
