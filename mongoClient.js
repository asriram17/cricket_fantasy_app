const { MongoClient, ServerApiVersion } = require('mongodb');
const env = require('dotenv');

env.config();

const DB_USER = process.env.DB_USER;
const DB_PWD = process.env.DB_PWD;
const DB_URL = process.env.DB_URL;

const uri = "mongodb+srv://"+DB_USER+":"+DB_PWD+"@"+DB_URL+"/?retryWrites=true&w=majority&appName=task";

let client;
let db;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        db = client.db('test');
        console.log("Successfully connected to MongoDB!");
    }
    return { client, db };
}

module.exports = connectToDatabase;
