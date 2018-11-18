import { html, renderToString } from "@popeindustries/lit-html-server";
import { createAppTemplateResult } from "./templates.js";

const meta = () => `
    <title>Custom Elements</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
`;

const scripts = serializedData => `
    <script type="module">
        import {hydrate, init} from './browser.js'
        hydrate(${serializedData}, document.getElementById('app'))
        init()
    </script>
`;

const head = (meta, scripts) => `
    <head>
        ${meta}
        ${scripts}
    </head>
`;

const body = app => `
    <body>
        <div id="app">${app}</div>
    </body>
`;

const htmlWrapper = (head, body) => `
    <!DOCTYPE html>
    <html>
        ${head}
        ${body}
    </html>
`;

module.exports = async ({ data }) => {
  const appTemplateResult = createAppTemplateResult(html, data);
  const headHTML = head(meta(), scripts(JSON.stringify(data)));
  const htmlMarkup = htmlWrapper(headHTML, body(appTemplateResult));

  return renderToString(htmlMarkup);
};
