const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../src/models/Product');

(async () => {
  try {
    const count = await Product.countDocuments();
    console.log('Product collection count:', count);
    if (count < 1) {
      throw new Error('Expected at least one product in MongoDB.');
    }
    console.log('PASS');
    process.exit(0);
  } catch (error) {
    console.error('FAIL:', error.message);
    process.exit(1);
  }
})();
