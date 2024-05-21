const { runUpdates } = require('../../src/runUpdates');

module.exports = async (req, res) => {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  try {
    await runUpdates();
    res.status(200).send('Update successful');
  } catch (error) {
    console.error('Error in cron job:', error);
    res.status(500).send('Internal Server Error');
  }
};
