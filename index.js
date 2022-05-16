const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { application } = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// middleware 
app.use(express.json());
app.use(cors());

// default routes
app.get('/', (req, res)=>{
    res.send('Hello world');
});

// Mongo db
const uri = "mongodb+srv://Assignment11:Assignment11@cluster0.5co6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    await client.connect(); 
    const carCollection = client.db('cars').collection('car');

    // get all cars
    app.get('/cars', async(req, res)=>{
        const query = {};
        const cursor = carCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    });
    // get car data for home page
    app.get("/threeCars", async(req, res)=>{
        const query = {};
        const count = await carCollection.estimatedDocumentCount();
        const skip = count - 3;
        const cursor = carCollection.find({});
        const result = await cursor.skip(skip).limit(3).toArray();
        res.send(result);
    });
    //get single product by id
    app.get("/car/:id", async(req, res)=>{
        const {id} = req.params;
        const query = {_id: ObjectId(id)};
        const result = await carCollection.findOne(query);
        res.send(result);
    });
    // get product base on email;
    app.get('/myItems', async(req, res)=>{
        const email = req.query.email;
        const query = {email};
        const cursor = carCollection.find(query);
        const reslut = await cursor.toArray();
        res.send(result);
    });
    //Add a new product
    app.post('/car', async(req, res)=>{
        const data = req.body;
        const result = await carCollection.insertOne(data);
        res.send(result);
    });
    // update single product 
    app.put('/car/:id', async(req, res)=>{
        const {id} = req.params;
        const updatedDoc = req.body;
        const query = {_id : ObjectId(id)};
        const option = {upsert : true};
        const updateInfo = {$set : updatedDoc};
        const result = await carCollection.updateOne(query, updateInfo, option);
        res.send(result);
    });
    //delete single product
    app.delete('/car/:id', async(req, res)=>{
        const {id} = req.params;
        const query = {_id : ObjectId(id)};
        const result = await carCollection.deleteOne(query);
        res.send(result)
    });
}

run().catch(console.dir);

app.listen(PORT, ()=>{
    console.log('The server is running.')
});
