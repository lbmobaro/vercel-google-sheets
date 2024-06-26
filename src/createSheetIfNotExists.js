// createSheetIfNotExists.js
async function createSheetIfNotExists(sheets, sheetName) {
  try {
    const sheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SHEET_ID,
    });
    const sheetExists = sheetResponse.data.sheets.some(sheet => sheet.properties.title === sheetName);

    if (!sheetExists) {
      const requests = [
        {
          addSheet: {
            properties: {
              title: sheetName,
              index: 0, // Add the new sheet to the left-most position
            },
          },
        },
      ];

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.SHEET_ID,
        resource: { requests },
      });

      console.log(`Sheet "${sheetName}" created successfully in the left-most position`);
    } else {
      console.log(`Sheet "${sheetName}" already exists`);
    }
    return !sheetExists;
  } catch (error) {
    console.error(`Error checking/creating sheet "${sheetName}":`, error);
    throw new Error(`Error checking/creating sheet "${sheetName}"`);
  }
}

module.exports = createSheetIfNotExists;
