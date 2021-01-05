const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

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
  res.send("File not found!");
});

app.listen(3000, function () {
  console.log("App started on port 3000");
});
