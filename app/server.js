// import React from "react";
// import ReactDOMServer from "react-dom/server";

// import { App } from "./src/index.js";

// export default async dataObject => {
//   const template = markup => `
//       <div id="app">${markup}</div>
//       <script>
//         window.data = ${JSON.stringify(dataObject)}
//       </script>
//   `;

//   const markup = ReactDOMServer.renderToString(
//     React.createElement(App, dataObject)
//   );

//   return template(markup);
// };

import { getAsyncNeco } from "./src/async.js";

const app = async dataObject => {
  const template = markup => `
      <div id="app">${markup}</div>
      <script src="browser.js"></script>
      <script>
        window.data = ${JSON.stringify(dataObject)}
      </script>
  `;
  const markup = await getAsyncNeco();
  return template(markup);
};

export default app;

// export default () => {
//   return `<script src="browser.js"></script>`;
// };

// const app = async () => {
//   const { getAsyncNeco } = await import("./src/async.js");
//   const result = await getAsyncNeco();
//   return result;
// };
// export default app;
