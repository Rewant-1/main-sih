require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const MONGO_URI = config.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = config.DB_NAME || process.env.MONGO_DB_NAME || process.env.DB_NAME;

if (!MONGO_URI) {
  console.error('Please set MONGODB_URI in your environment');
  process.exit(1);
}

function maskUri(uri) {
  // mask after // up to @ if exists
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)(.*@)/, '$1***@');
}

(async function inspect() {
  try {
    const connectOptions = DB_NAME ? { dbName: DB_NAME } : undefined;
    console.log('Connecting to', maskUri(MONGO_URI), ' dbName:', DB_NAME || '<none>');
    await mongoose.connect(MONGO_URI, connectOptions);
    const db = mongoose.connection.db;
    console.log('Connected. Database:', db.databaseName);

    const colls = await db.listCollections().toArray();
    if (!colls || colls.length === 0) {
      console.log('No collections found in this database.');
    } else {
      console.log('Collections:');
      for (const c of colls) {
        const count = await db.collection(c.name).countDocuments();
        console.log(` - ${c.name}: ${count}`);
      }
    }

    // Show counts for important collections as a quick summary
    const important = ['users', 'alumnis', 'students', 'jobs', 'events', 'posts', 'campaigns', 'successstories', 'surveys', 'newsletters', 'connections', 'chats'];
    console.log('\nQuick summary:');
    for (const name of important) {
      try {
        const exists = await db.listCollections({ name }).toArray();
        if (exists.length > 0) {
          const cnt = await db.collection(name).countDocuments();
          console.log(` - ${name}: ${cnt}`);
        } else {
          // try plural variations or camel case
          // nothing
        }
      } catch (e) {
        // ignore errors
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
