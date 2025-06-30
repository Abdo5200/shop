const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnection = async (callback) => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://abdelrahman_mamdouh:AmdRyzen32200g@cluster0.henws.mongodb.net/node-course?retryWrites=true&w=majority&appName=Cluster0"
    );
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
