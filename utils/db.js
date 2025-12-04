const mongoose = require('mongoose');
const { MONGO_URI, DB_NAME } = require('../config');


const dbConnect = async () => {
  try {
  // If DB_NAME provided, pass it as `dbName` option - so Mongoose connects to the intended DB
  const connectOptions = DB_NAME ? { dbName: DB_NAME } : undefined;
  mongoose.connect(MONGO_URI, connectOptions);

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    // Print more details to help troubleshoot Compass/connection mismatch
    try {
      const dbName = db?.db?.databaseName || db?.databaseName || mongoose.connection.name;
      const hosts = mongoose?.connection?.client?.s?.url || mongoose?.connection?.host || 'unknown-host';
      console.log(`Connected to MongoDB. host=${hosts} database=${dbName}`);
    } catch (err) {
      console.log('Connected to MongoDB (unable to print host/database):', err);
    }
  });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = dbConnect;