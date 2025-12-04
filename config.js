require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;
// Optional database name if the connection URI doesn't contain the DB name
// Preferred: include DB name in MONGODB_URI; fallback to `MONGO_DB_NAME` or `DB_NAME`.
const DB_NAME = process.env.MONGO_DB_NAME || process.env.DB_NAME || process.env.MONGODB_DB_NAME || null;

module.exports = {
    MONGO_URI,
    DB_NAME,
    PORT,
};
