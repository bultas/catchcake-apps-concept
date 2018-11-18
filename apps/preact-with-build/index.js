// import ReactDOMServer from "react-dom/server";

import render from "preact-render-to-string";

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
  const markup = render(result);
  return template(markup);
};

export default app;
