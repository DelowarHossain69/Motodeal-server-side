const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 5000;
require("dotenv").config();


// middleware
app.use(express.json());
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("*", cors(corsConfig))
app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,authorization")
  next()
})

// JWT verify
function jwtVerify(req, res, next) {
  const authHeader = req.headers.auth;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorize Access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;

    next();
  });
}

// default routes
app.get("/", (req, res) => {
  res.send("Hello world");
});

// Mongo db connected
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5co6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db("cars").collection("car");

    // verify login
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // get all cars
    app.get("/cars", async (req, res) => {
      const query = {};
      const cursor = carCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get car data for home page
    app.get("/threeCars", async (req, res) => {
      const query = {};
      const count = await carCollection.estimatedDocumentCount();
      const skip = count - 3;
      const cursor = carCollection.find({});
      const result = await cursor.skip(skip).limit(3).toArray();
      res.send(result);
    });

    //get single product by id
    app.get("/car/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.send(result);
    });

    // get product base on email;
    app.get("/myItems", jwtVerify, async (req, res) => {
      const newEmail = req.query.email;
      const email = req.decoded.email;

      if (email === newEmail) {
        const query = { email: newEmail };
        const cursor = carCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden access" });
      }
    });

    //Add a new product
    app.post("/car", async (req, res) => {
      const data = req.body;
      const result = await carCollection.insertOne(data);
      res.send(result);
    });

    // update single product
    app.put("/car/:id", async (req, res) => {
      const { id } = req.params;
      const updatedDoc = req.body;
      const query = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateInfo = { $set: updatedDoc };
      const result = await carCollection.updateOne(query, updateInfo, option);
      res.send(result);
    });

    //delete single product
    app.delete("/car/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.send(result);
    });

  } 
  finally {

  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log("The server is running.");
});
