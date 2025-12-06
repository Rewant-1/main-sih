const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { PORT } = require('./config');
const v1Routes = require('./src/routes/v1');
const dbConnect = require('./utils/db.js');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Minimal request logger for development debugging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    try {
      console.debug(`[Request] ${req.method} ${req.originalUrl} - ${req.ip}`);
    } catch (e) {}
    next();
  });
}

app.use('/api/v1', v1Routes);

// Start DB and then start the server — ensures we only start listening once DB connection succeeds
dbConnect()
  .then(() => {
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Could not start server due to DB error:', err);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});