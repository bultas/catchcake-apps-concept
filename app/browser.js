// import React from "react";
// import ReactDOM from "react-dom";

// import { App } from "./src/index.js";

// const dataObject = window.data;

// const getResult = async data => {
//   const result = await render(data);
//   return result;
// };

// render(data).then(Elem => {
//   ReactDOM.hydrate(Elem, document.querySelector(`#app`));
// });

// ReactDOM.hydrate(render(dataObject), document.querySelector(`#app`));

import ReactDOM from "react-dom";

import { createAppElement } from "./src/index.js";

export default async data => {
  const AppElement = await createAppElement(data);
  ReactDOM.hydrate(AppElement, document.querySelector(`#app`));
};
