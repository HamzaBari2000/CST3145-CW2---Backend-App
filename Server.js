const express = require("express");
const path = require("path");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const bodyParser = require("body-parser");

const app = express();

//Start of the database

let db;
MongoClient.connect(
  "mongodb+srv://hamza:cw2@cluster0.nxvhu.mongodb.net/learningApp?retryWrites=true&w=majority",
  (err, client) => {
    db = client.db("learningApp");
  }
);

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g., /collection/messages");
});

//A GET Route which returns all the lessons.
app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.send(results);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//A POST Route Which saves the new Order to the Database.
app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
  });
});

//A PUT Route which updates the number of available spaces in the ‘lesson’ collection.
app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "Updated" } : { msg: "Error" });
    }
  );
});

//End of the Database

//Start of Middleware

app.use(function (req, res, next) {
  console.log("Request IP: " + req.url);
  console.log("Request date: " + new Date());
  next();
});

app.use(function (req, res, next) {
  // Uses path.join to find the path where the file should be
  var filePath = path.join(__dirname, "Client/img", req.url);
  // Built-in fs.stat gets info about a file
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

app.use(function (req, res) {
  // Sets the status code to 404
  res.status(404);
  // Sends the error "File not found!”
  res.send("File not found, Please enter the correct file path or name!");
});

//End of Middleware

app.use(function (req, res, next) {
  // allow different IP address
  res.header("Access-Control-Allow-Origin", "*");
  // allow different header fields
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const port = process.env.PORT || 3000;
app.listen(port);
console.log("App started on port 3000");
