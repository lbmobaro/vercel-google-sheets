// index.js
const express = require('express');
const { runUpdates } = require('./runUpdates'); // Import your main function

const app = express();

app.get('/api/update-sheet', async (req, res) => {
  try {
    await runUpdates(); // Call your main function to run updates
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
