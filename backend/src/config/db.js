const mongoose = require('mongoose');

const RETRY_DELAY_MS = 10000;

function getUri() {
  return process.env.MONGO_URI || 'mongodb://localhost:27017/Serviots';
}

// Hide credentials when logging a connection string.
function redact(uri) {
  return uri.replace(/\/\/([^@/]+)@/, '//***:***@');
}

async function connectDB() {
  const uri = getUri();
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[db] connected -> ${redact(uri)}`);
}

// Keeps retrying until MongoDB is reachable, so a database outage never
// crashes the server process. Scripts (seed) use connectDB directly.
async function connectWithRetry() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await connectDB();
      return;
    } catch (err) {
      console.error(
        `[db] connection attempt ${attempt} failed (${err.code || err.name}: ${err.message}); retrying in ${RETRY_DELAY_MS / 1000}s`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

const isConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.connectWithRetry = connectWithRetry;
module.exports.isConnected = isConnected;
