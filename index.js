const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

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

    // Get All Jobs by filtering 
    app.get("/jobs", async (req, res) => {
      let query = {};
      const { category } = req.query;
      if (category) {
        query = { category: category };
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    // Get single Jobs 
    app.get('/details/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobCollection.findOne(query);
      res.send(result)
    })

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
