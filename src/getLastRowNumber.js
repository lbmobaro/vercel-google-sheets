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

module.exports = getLastRowNumber;
