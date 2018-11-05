// import React from "react";
// import ReactDOM from "react-dom";

// import { App } from "./src/index.js";

// const { data, path } = window.data;
// const appID = "app";

// ReactDOM.hydrate(
//   React.createElement(App, { data, path }),
//   document.querySelector(`#${appID}`)
// );

import { getAsyncNeco } from "./src/async.js";

const app = async () => {
  return getAsyncNeco();
};

app().then(result => {
  console.log(result);
});
