const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const ports = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin : [
        'http://localhost:5173'
    ],
    credentials : true
}
));
app.use(express.json());
app.use(cookieParser())

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


// middleware
const logger = (req, res, next) => {
    console.log('log info :', req.method, req.url );
    next();
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log('token middleware', token);


    if(!token){
        return res.status(401).send({message : 'unauthorize access'})
    }
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if(err){
            return res.status(401).send({message : 'unauthorize access'})
        }
        req.user = decoded;
        next();
    })

}

async function run() {
  try {
    const FoodCollection = client.db("FoodDB").collection("myAddedFood");
    const OrderCollection = client.db("FoodDB").collection("orderedFood");


    //jwt api 
    app.post('/jwt', async (req, res) => {
        const user= req.body;
        console.log('user token', user);
        const token = jwt.sign(user, process.env.JWT_TOKEN , {expiresIn: '1hr' });

        res.cookie('token', token, {
            httpOnly : true,
            secure : true,
            sameSite : 'none'
        })
        .send({success : true});


    })

    app.post('/logOut', async (req, res) => {
        
        const user = req.body;
        console.log('logOut', user);
        res.clearCookie('token', {maxAge: 0}).send({success:true})

    })


    // ordered food

    app.get("/orderedFood/:email", logger, verifyToken, async (req, res) => {
        const email = req.params.email;
        const query = { newEmail : email };
        const result = await OrderCollection.find(query).toArray();
        // if(req.user.email !== req.query.email){
        //     return res.status(403).send({message : 'forbidden access'})
        // }
        console.log(result);
        res.send(result);
      });

      app.get("/orderedFood", logger, verifyToken, async (req, res) => {
        const cursor = OrderCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.post("/orderedFood", logger, verifyToken, async (req, res) => {
        const newOrderedFood = req.body;
        console.log(newOrderedFood);
        const result = await OrderCollection.insertOne(newOrderedFood);
        res.send(result);
      });

      app.delete('/orderedFood/:id', logger, verifyToken,  async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await OrderCollection.deleteOne(query);
        res.send(result);
 
     })

    // added food
    app.get("/myAddedFood",  async (req, res) => {
      console.log(req.query.email);
    //   console.log('coookiessss', req.cookies);
   
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

    app.get("/myAddedFoodCount", async (req, res) => {
        const count = FoodCollection.estimatedDocumentCount();
        res.send({count});
      });
    app.post("/myAddedFood", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await FoodCollection.insertOne(newFood);
      res.send(result);
    });


    app.put("/myAddedFood/:id", logger, verifyToken, async (req, res) => {
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
