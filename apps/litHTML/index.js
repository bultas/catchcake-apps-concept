import { html, renderToString } from "@popeindustries/lit-html-server";
import { createAppTemplateResult } from "./modules/templates.js";

const meta = () => `
    <title>Custom Elements</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="modules/styles.css">
`;

// const scripts = serializedData => `
//     <script type="module">
//         window.initialState = ${serializedData};
//         import {hydrate, init} from '/modules/browser.js'
//         hydrate(${serializedData}, document.getElementById('app'))
//         init()
//     </script>
// `;

const scripts = serializedData => `
    <script>window.initialState = ${serializedData}</script>
    <script type="module" src="/modules/init.js"></script>
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

module.exports = async dataObject => {
  const appTemplateResult = createAppTemplateResult(html, dataObject);
  const headHTML = head(meta(), scripts(JSON.stringify(dataObject)));
  const htmlMarkup = htmlWrapper(headHTML, body(appTemplateResult));

  return renderToString(htmlMarkup);
};
