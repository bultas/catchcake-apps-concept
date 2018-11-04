import React from "react";
import ReactDOMServer from "react-dom/server";

import { App } from "./src/index.js";

const appID = "app";

export default ({ path, data }) => {
  const template = markup => `
          <div id="${appID}">${markup}</div>
          <script>
            window.data = { data: ${JSON.stringify(data)}, path: '${path}' }
          </script>
          <script src="${appID}-browser.js"></script>
      `;
  const markup = ReactDOMServer.renderToString(
    React.createElement(App, { path, data })
  );
  return template(markup);
};
