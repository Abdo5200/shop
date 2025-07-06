const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
require("dotenv").config();
const mongoConnection = async (callback) => {
  try {
    const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.henws.mongodb.net/node-course?retryWrites=true&w=majority&appName=Cluster0`;
    const client = await MongoClient.connect(MONGODB_URI);
    console.log("connected");
    _db = await client.db();
    callback();
  } catch (err) {
    console.log(err);
    throw err;
  }
  //?this is the promise based approach
  // MongoClient.connect(
  //   "mongodb+srv://abdelrahman_mamdouh:AmdRyzen32200g@cluster0.henws.mongodb.net/node-course?retryWrites=true&w=majority&appName=Cluster0"
  // )
  //   .then((client) => {
  //     console.log("connected");
  //     _db = client.db();
  //     callback();
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     throw err;
  //   });
};
const getDB = () => {
  if (_db) return _db;
  throw "No DataBase found";
};
module.exports.mongoConnection = mongoConnection;
module.exports.getDB = getDB;
