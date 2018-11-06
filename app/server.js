// import React from "react";
// import ReactDOMServer from "react-dom/server";

// import { App } from "./src/index.js";

// const app = async dataObject => {
//   const template = markup => `
//       <script>
//         window.data = ${JSON.stringify(dataObject)}
//       </script>
//       <div id="app">${markup}</div>
//       <script src="browser.js"></script>
//   `;

//   const markup = ReactDOMServer.renderToString(
//     React.createElement(App, dataObject)
//   );

//   return template(markup);
// };

// export default app;

import ReactDOMServer from "react-dom/server";

import { createAppElement } from "./src/index.js";

const app = async dataObject => {
  const template = markup => `
      <div id="app">${markup}</div>
      <script type="module">
        import hydrate from './browser.js';
        hydrate(${JSON.stringify(dataObject)});
      </script>
  `;

  const result = await createAppElement(dataObject);
  const markup = ReactDOMServer.renderToString(result);
  return template(markup);
};

export default app;
