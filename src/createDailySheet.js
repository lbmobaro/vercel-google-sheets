const createSheetIfNotExists = require('./createSheetIfNotExists');

async function createDailySheet(sheets, sheetName) {
  const isNewSheet = await createSheetIfNotExists(sheets, sheetName);
  if (isNewSheet) {
    const sheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SHEET_ID,
    });
    const sheetId = sheetResponse.data.sheets.find(sheet => sheet.properties.title === sheetName).properties.sheetId;

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
      spreadsheetId: process.env.SHEET_ID,
      resource: { requests },
    });

    console.log(`Sheet "${sheetName}" formatted successfully`);
  }
  return isNewSheet;
}

module.exports = createDailySheet;
