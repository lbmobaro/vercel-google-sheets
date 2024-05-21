const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8'));

async function getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  console.log('Authenticated with service account:', credentials.client_email); // Log the service account email
  return google.sheets({ version: 'v4', auth: authClient });
}

module.exports = { getGoogleSheetClient };
