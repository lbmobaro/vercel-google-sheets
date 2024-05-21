const axios = require('axios');
const API_BASE_URL = process.env.API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

async function fetchLatestCycleTime() {
  const apiUrl = `${API_BASE_URL}/results?Checklists=checklists/106115-C&limit=1&sort=answered:desc`;

  console.log('Fetching latest cycle time from API URL:', apiUrl);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-api-key': API_TOKEN,
      },
    });
    const latestResult = response.data.items[0];
    const cycleTimeInSeconds = latestResult.values[0].answers[0];
    const cycleTime = new Date(cycleTimeInSeconds * 1000).toISOString().substr(14, 5); // Convert to mm:ss format
    console.log('Latest cycle time fetched successfully:', cycleTime);
    return cycleTime;
  } catch (error) {
    console.error('Error fetching latest cycle time:', error.response ? error.response.data : error.message);
    throw new Error('Error fetching latest cycle time');
  }
}

module.exports = fetchLatestCycleTime;
