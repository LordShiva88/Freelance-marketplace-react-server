const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
var cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;

// Middle Ware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://freelance-bd.web.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqtbidh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const logger = (req, res, next) => {
  console.log("loginfo", req.method, req.url);
  next();
};

async function run() {
  try {
    await client.connect();
    const jobCollection = client.db("FreelanceBD").collection("Jobs");
    const bidsCollection = client.db("FreelanceBD").collection("Bids");
    const testCollection = client.db("FreelanceBD").collection("Testimonials");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

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
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // Update Job
    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          category: updateData.deadline,
          deadline: updateData.category,
          description: updateData.description,
          job_title: updateData.job_title,
          maximum_price: updateData.maximum_price,
          minimum_price: updateData.minimum_price,
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

    // Post bids
    app.post("/bids", logger, async (req, res) => {
      const jobs = req.body;
      const result = await bidsCollection.insertOne(jobs);
      res.send(result);
    });

    // Get my bids data using Email
    app.get("/bids", async (req, res) => {
      console.log(req.cookies);
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

    // Update bids status
    app.put("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: update.status,
        },
      };
      const result = await bidsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // get testimonials
    app.get("/testimonials", async (req, res) => {
      const result = await testCollection.find().toArray();
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
