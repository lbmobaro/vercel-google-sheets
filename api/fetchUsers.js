const axios = require('axios');
const API_BASE_URL = process.env.API_BASE_URL;
const API_USER_GROUP = process.env.API_USER_GROUP;
const API_TOKEN = process.env.API_TOKEN;

async function fetchUsers() {
  const apiUrl = `${API_BASE_URL}/usergroups/${API_USER_GROUP}`;

  console.log('Fetching user data from API URL:', apiUrl);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'x-api-key': API_TOKEN,
      },
    });
    const users = response.data.users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {});
    console.log('User data fetched successfully:', users);
    return users;
  } catch (error) {
    console.error('Error fetching user data:', error.response ? error.response.data : error.message);
    throw new Error('Error fetching user data');
  }
}

module.exports = { fetchUsers };
