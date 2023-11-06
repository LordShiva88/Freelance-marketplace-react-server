const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;

// Middle Ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqtbidh.mongodb.net/?retryWrites=true&w=majority`;

console.log(process.env.DB_USER);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const jobCollection = client.db("FreelanceBD").collection("Jobs");
    const bidsCollection = client.db("FreelanceBD").collection("Bids");

    // Post a job
    app.post("/jobs", async (req, res) => {
      const jobs = req.body;
      const result = await jobCollection.insertOne(jobs);
      res.send(result);
    });

    // Get All Jobs by filtering
    app.get("/jobs", async (req, res) => {
      let query = {};
      const { category, email } = req.query;
      if (category) {
        query = { category: category };
      }
      if (email) {
        query = { email: email };
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    // Delete Job
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // Update Job
    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          category:updateData.deadline,
          deadline:updateData.category,
          description:updateData.description,
          job_title:updateData.job_title,
          maximum_price:updateData.maximum_price,
          minimum_price:updateData.minimum_price,
        },
      };
      const result = await jobCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // Get single Jobs
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.post("/bids", async (req, res) => {
      const jobs = req.body;
      const result = await bidsCollection.insertOne(jobs);
      res.send(result);
    });

    // Get data using Email
    app.get("/bids", async (req, res) => {
      let query = {};
      const { email } = req.query;
      if (email) {
        query = { userEmail: email };
      }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/bids/request", async (req, res) => {
      let query = {};
      const { email } = req.query;
      if (email) {
        query = { email: email };
      }
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello My server is running");
});

app.listen(port, () => {
  console.log(`My server is running with port ${port}`);
});
