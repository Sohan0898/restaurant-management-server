const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const ports = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8p2aqm7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const FoodCollection = client.db("FoodDB").collection("myAddedFood");
    const OrderCollection = client.db("FoodDB").collection("orderedFood");



    app.get('/myAddedFood/:id', async (req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await FoodCollection.findOne(query);
        res.send(result);
      })

    app.get('/myAddedFood', async (req, res)=>{
        const cursor =FoodCollection.find();
        const result= await  cursor.toArray();
        res.send(result);
    })

    app.post("/myAddedFood", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await FoodCollection.insertOne(newFood);
      res.send(result);
    });

    app.post("/orderedFood", async (req, res) => {
        const newOrderedFood = req.body;
        console.log(newOrderedFood);
        const result = await OrderCollection.insertOne(newOrderedFood);
        res.send(result);
      });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// routes

app.get("/", (req, res) => {
  res.send("FoodieFeast Server Started");
});

app.listen(ports, () => {
  console.log(`FoodieFeast server running on port ${ports}`);
});
