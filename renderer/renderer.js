module.exports = ({ appPath, data, path }) => {
  const App = require(appPath);
  return `${App({ data, path })}`;
};
