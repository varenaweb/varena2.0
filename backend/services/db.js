const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let client;
let database;

async function connectDB() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  if (database) {
    return database;
  }
  client = new MongoClient(uri);
  await client.connect();
  database = client.db();
  console.log("Connected to MongoDB");
  return database;
}

function getDB() {
  if (!database) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return database;
}

function getClient() {
  if (!client) {
    throw new Error("Mongo client not initialized. Call connectDB first.");
  }
  return client;
}

module.exports = { connectDB, getDB, getClient };
