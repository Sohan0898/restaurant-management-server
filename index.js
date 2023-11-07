const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // ordered food

    app.get("/orderedFood/:email", async (req, res) => {
        const email = req.params.email;
        const query = { newEmail : email };
        const result = await OrderCollection.find(query).toArray();
        console.log(result);
        res.send(result);
      });

      app.get("/orderedFood", async (req, res) => {
        const cursor = OrderCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.post("/orderedFood", async (req, res) => {
        const newOrderedFood = req.body;
        console.log(newOrderedFood);
        const result = await OrderCollection.insertOne(newOrderedFood);
        res.send(result);
      });

      app.delete('/orderedFood/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await OrderCollection.deleteOne(query);
        res.send(result);
 
     })

    // added food
    app.get("/myAddedFood", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await FoodCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/myAddedFood/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await FoodCollection.findOne(filter);
      console.log(result);
      res.send(result);
    });

    app.get("/myAddedFood", async (req, res) => {
      const cursor = FoodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/myAddedFood", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await FoodCollection.insertOne(newFood);
      res.send(result);
    });


    app.put("/myAddedFood/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateFood = req.body;
      const food = {
        $set: {
          foodName: updateFood.foodName,
          image: updateFood.image,
          category: updateFood.category,
          price: updateFood.price,
          description: updateFood.description,
          rating: updateFood.rating,
          quantity: updateFood.quantity,
          origin: updateFood.origin,
        },
      };
      const result = await FoodCollection.updateOne(filter, food, options);
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
