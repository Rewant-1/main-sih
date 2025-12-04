const mongoose = require("mongoose");
const { MONGO_URI, DB_NAME } = require("../config");

const dbConnect = async () => {
  try {
    const uri = MONGO_URI || "mongodb://localhost:27017/sih_2025";
    const connectOptions = DB_NAME ? { dbName: DB_NAME } : undefined;

    // Mask the credentials when logging the URI (do not leak secrets)
    const displayUri = uri.replace(/(mongodb\+srv:\/\/)(.*@)/, '$1***@');
    console.log(`Attempting to connect to MongoDB at ${displayUri} with dbName=${DB_NAME || '<none>'}`);

    await mongoose.connect(uri, connectOptions);
    
    // Log immediately after connect succeeds
    console.log("✅ MongoDB connection established successfully!");

    const db = mongoose.connection;
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    
    db.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err; // Re-throw so app.js can handle it
  }
};

module.exports = dbConnect;
