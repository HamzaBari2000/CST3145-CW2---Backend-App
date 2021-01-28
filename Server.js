const express = require("express"); //This is the required express module libary.
const path = require("path"); //Required for finding the file path of the images/or any files.
const fs = require("fs"); //Gets the information about the files.
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const bodyParser = require("body-parser");

const app = express(); //This is where the express app has been created by calling the express function.

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

// Cors for cross origin allowance
const cors = require("cors");
app.use(cors());

app.get("/", (req, res, next) => {
  res.send(
    "Select a collection, e.g., /collection/collectionName or Select an Image, e.g., /ImageName.png"
  );
});

//A GET Route which returns all the lessons.
app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    // allow different IP address
    res.header("Access-Control-Allow-Origin", "*");
    // allow different header fields
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
    res.header("Access-Control-Allow-Origin", "*");
    // allow different header fields
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.send(results.ops);
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

//Start of Middleware for getting images.

//This is the Middleware Logger which outputs the request to the server.
app.use(function (req, res, next) {
  //Outputs the URL when the server starts and updates the URL depending on the next request.
  console.log("Request IP: " + req.url); //e.g., will return the Image path if reauested for an Image.
  console.log("Request date: " + new Date()); //Outputs the current date when the server starts.
  next(); //The next is used for stopping the browser from hanging. This way it will continue to the next function of the MR Stack.
});

app.use(function (req, res, next) {
  // The path.join has been used for finding the file from its directory. In this case the file was in the Client directory.
  let filePath = path.join(__dirname, "Client/img", req.url);
  // The fs.stat is used getting the information about the file.
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    //If the Image file exists
    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

//No next is required because this will be the last middleware.
app.use(function (req, res) {
  // Sets the status code to 404, which is the error status.
  res.status(404);
  // If the file is not found or if there are any errors in the file path then, it will return this error message.
  res.send("File not found, Please enter the correct file path or name!");
});

//End of for getting images.

const port = process.env.PORT || 3000;
app.listen(port);
console.log("App has started on port " + port); //Returns a message onto the console to alert that the serer has been sated on this port number.
