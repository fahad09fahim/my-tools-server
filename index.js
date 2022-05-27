const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m658y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const toolsCollection = client.db("mytools").collection("tools");
    const reviewCollection = client.db("mytools").collection("reviews");

    // load tools to client
    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolsCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });
    // load reviews to client
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.post("/order", async (req, res) => {
      const order = req.body;
      const query = {
        name: order.productName,
        available: order.quantity,
      };
      const exists = await toolsCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, order: exists });
      }
      const result = await toolsCollection.insertOne(order);

      res.send({ success: true, result });
    });
  } finally {
  }
}
run().catch();
app.get("/", (req, res) => {
  res.send("Hello from my tools!");
});

app.listen(port, () => {
  console.log(`MY-Tools app listening on port ${port}`);
});
