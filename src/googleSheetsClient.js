const { google } = require('googleapis');
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8'));

async function googleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  console.log('Authenticated with service account:', credentials.client_email); // Log the service account email
  return google.sheets({ version: 'v4', auth: authClient });
}

module.exports = googleSheetsClient;
