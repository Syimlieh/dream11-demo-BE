const { MongoClient, ServerApiVersion } = require("mongodb");

// Database Details
const DB_USER = process.env["DB_USER"];
const DB_PWD = process.env["DB_PWD"];
const DB_URL = process.env["DB_URL"];
const DB_NAME = "task-jeff";
const DB_COLLECTION_NAME = "players";

// Use This for atlas
// Mongo URI
// const uri =
//   "mongodb+srv://" +
//   DB_USER +
//   ":" +
//   DB_PWD +
//   "@" +
//   DB_URL +
//   "/?retryWrites=true&w=majority";

// Use this For local DB
const uri = "mongodb://127.0.0.1:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let dbPromise;
async function connectDB() {
  if (!dbPromise) {
    dbPromise = client
      .connect()
      .then(() => {
        db = client.db(DB_NAME);
        console.log("You successfully connected to MongoDB!");
        return db;
      })
      .catch((error) => {
        console.error("Failed to connect to MongoDB", error);
        throw error;
      });
  }
  return dbPromise;
}

const getDB = () => {
  if (!db) {
    throw new Error("Database not connected");
  }

  return db;
};

module.exports = { connectDB, getDB };
