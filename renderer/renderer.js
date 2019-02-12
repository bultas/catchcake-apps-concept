const appPath = process.argv[2];
const dataString = process.argv[3];

require = require("esm")(module /*, options*/);

const getRenderOutput = async (appPath, data) => {
  const render = require(appPath).default;
  const result = await render(data);
  console.log(result);
};

if (appPath && dataString) {
  getRenderOutput(appPath, JSON.parse(dataString));
}
