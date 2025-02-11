import { MongoClient, ServerApiVersion } from "mongodb";
const mongodbUSER = process.env.MONGODBUS;
const mongodbPW = process.env.MONGODBPW;

//const mongoUser = encodeURIComponent(mongodbUSER);
//const mongoPW = encodeURIComponent(mongodbPW);

if (!mongodbUSER || !mongodbPW) {
  console.error("MongoDB credentials are not set!");

  process.exit(1);
}

const uri = process.env.MONGODB_URI || "fallback_local_uri_for_dev";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000, // ✅ Wait 30 seconds for DB connection
});

console.log("MongoDB User:", process.env.MONGODBUS ? "Loaded" : "Not Loaded");
console.log(
  "MongoDB Password:",
  process.env.MONGODBPW ? "Loaded" : "Not Loaded"
);

// Singleton pattern for MongoDB connection
let db = null;
async function connectToDatabase() {
  try {
    if (!db) {
      await mongoClient.connect(); // Connect the client to MongoDB
      console.log("Connected to MongoDB successfully!");
      db = mongoClient.db("current_users"); // Specify the database name here
    }

    return db; // Return the database instance
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    throw error;
  }
}

// Gracefully close the connection
async function closeDatabaseConnection() {
  try {
    await mongoClient.close();
    console.log("MongoDB connection closed gracefully.");
  } catch (e) {
    console.error("Error during MongoDB connection closure", e);
  }
}

export { connectToDatabase, closeDatabaseConnection, mongoClient };
