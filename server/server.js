const express = require("express");
const exec = require("child_process").exec;
const app = express();

// TODO use package.json main to load index, but we have problem with serverStatic..
// const appPath = "../apps/reason";
const appPath = "../apps/card";
// app.use(express.static(`${appPath}/dist`));
app.use(express.static(`${appPath}/static`));

app.get("*", async (req, res, next) => {
  const rendererPath = "../renderer/renderer.js";
  // const appIndexPath = `${appPath}/lib/es6/src/Index.bs.js`;
  const appIndexPath = `${appPath}/index.js`;

  const path = req.originalUrl;
  const data = { data: { name: "Pinocchio", content: "lorem impsun" }, path };

  const serializedData = JSON.stringify(data);

  const command = `node ${rendererPath} '${appIndexPath}' '${serializedData}'`;

  console.log(command);

  exec(command, function(error, stdout, stderr) {
    const result = stderr || stdout;
    res.send(result);
  });
});

app.listen(3000, () => {
  console.log(`Server is listening on port: 3000`);
});
