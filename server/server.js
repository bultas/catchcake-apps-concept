const express = require("express");

const renderer = require("../renderer/renderer.js");

const app = express();

app.use(express.static("../app/dist"));

const data = {
  name: "App name",
  db: {}
};

const appPath = "../app/dist/app.js";

app.get("*", (req, res, next) => {
  const path = req.originalUrl;
  res.send(renderer({ appPath, data, path }));
});

app.listen(3000, () => {
  console.log(`Server is listening on port: 3000`);
});
