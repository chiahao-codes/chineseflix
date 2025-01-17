import { MongoClient, ServerApiVersion } from "mongodb";
const mongodbUSER = process.env.MONGODBUS;
const mongodbPW = process.env.MONGODBPW;
const mongoUser = encodeURIComponent(mongodbUSER);
const mongoPW = encodeURIComponent(mongodbPW);
const uri = `mongodb+srv://${mongoUser}:${mongoPW}@chineseflix.r2ugzun.mongodb.net/?retryWrites=true&w=majority&appName=CHINESEFLIX`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await mongoClient.connect();
    console.log("You successfully connected to MongoDB!");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
  }
}

async function closeDatabaseConnection() {
  try {
    await mongoClient.close();
    console.log("MongoDB connection closed gracefully.");
  } catch (e) {
    console.error("Error during MongoDB connection closure", e);
  }
}

export { connectToDatabase, closeDatabaseConnection, mongoClient };
