const { fullUpdate } = require('../src/lib/scraper');

(async () => {
  try {
    await fullUpdate();
    console.log('Update successful');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
})();
