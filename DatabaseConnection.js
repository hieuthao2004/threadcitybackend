const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017";
const dbName = "myDatabase";

let db = null;

async function connectDB() {
    try {
        const client = await MongoClient.connect(url);
        db = client.db(dbName);
        await db.collection('users').insertOne({ name: "John", age: 30 });
        console.log("Connected to database:", dbName);
        console.log("Database created and data inserted!");

        client.close();
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

connectDB();
