const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const swaggerDocument = require("./swagger_output.json");

const port = 3000;

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Database
const { connectDB, getDB } = require("./db/connect.js");
const { collection } = require("./db/collections.db.js");

let db;
async function run() {
  try {
    await connectDB();
    db = getDB();
    await db
      .collection(collection.TEAMS)
      .createIndex({ teamName: 1 }, { unique: 1 });
  } catch (error) {
    console.error("Failed to run the application", error);
  }
}

run();

// Sample create document
async function sampleCreate() {
  const demo_doc = {
    demo: "doc demo",
    hello: "world",
  };
  const demo_create = await db.collection(collection.TEAMS).insertOne(demo_doc);

  console.log("Added!");
  console.log(demo_create.insertedId);
}

// Endpoints
require("./routes.js")(app);

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.get("/demo", async (req, res) => {
  await sampleCreate();
  res.send({ status: 1, message: "demo" });
});

// All the invalid routes which are not found are executed from here
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
