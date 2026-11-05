const app = require('./app');
const { connectWithRetry } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Bind the port first so the platform's health check passes even while the
// database is unreachable. DB-backed routes answer 503 until it connects
// (see app.js), and the connection keeps retrying in the background.
app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));

connectWithRetry();
