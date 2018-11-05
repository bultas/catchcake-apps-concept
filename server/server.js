const express = require("express");
const exec = require("child_process").exec;
const app = express();

app.use(express.static("../app/dist"));

app.get("*", async (req, res, next) => {
  const rendererPath = "../renderer/renderer.js";
  const appPath = "../app/dist/app.js";

  const path = req.originalUrl;
  const data = { data: { name: "Dan" }, path };

  const serializedData = JSON.stringify(data);

  const command = `node ${rendererPath} '${appPath}' '${serializedData}'`;

  exec(command, function(error, stdout, stderr) {
    const result = stderr || stdout;
    res.send(result);
  });
});

app.listen(3000, () => {
  console.log(`Server is listening on port: 3000`);
});
