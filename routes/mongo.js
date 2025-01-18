import { MongoClient, ServerApiVersion } from "mongodb";
const mongodbUSER = process.env.MONGODBUS;
const mongodbPW = process.env.MONGODBPW;
if (!mongodbUSER || !mongodbPW) {
  console.error(
    "MongoDB credentials are not set in the environment variables."
  );
  process.exit(1); // Exit the app if credentials are missing
}
const mongoUser = encodeURIComponent(mongodbUSER);
const mongoPW = encodeURIComponent(mongodbPW);

if (!mongodbUSER || !mongodbPW) {
  console.error("MongoDB credentials are not set!");
  process.exit(1);
}

const uri = process.env.MONGODB_URI || "fallback_local_uri_for_dev";

//const uri = `mongodb+srv://${mongoUser}:${mongoPW}@chineseflix.r2ugzun.mongodb.net/?retryWrites=true&w=majority&appName=CHINESEFLIX`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
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
    // Connect the client to the server	(optional starting in v4.7)
    //await mongoClient.connect();
    //console.log("You successfully connected to MongoDB!");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
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

/**
 * async function closeDatabaseConnection() {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoDB connection closed.");
  }
}
 
 */

export { connectToDatabase, closeDatabaseConnection, mongoClient };
