// src/index.js
const { runUpdates } = require('./runUpdates');

(async () => {
  try {
    await runUpdates();
    console.log('Update successful');
  } catch (error) {
    console.error('Error in update:', error);
  }
})();
