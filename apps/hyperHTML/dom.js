const Headline = (render, headline) => render`
    <h1>${headline}</h1>
  `;

const Content = (render, content) => render`
  <p>${content}</p>
  <special-button
    >click me</special-button
  >
`;

export const body = (render, model) => render`
<div>
    ${Headline(render, model.name)} ${Content(render, model.content)}
</div>
`;

export const markup = (render, model) => `<!DOCTYPE html>
<html>
    <head>

        <title>Custom Elements</title>

        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <script type="module">
            import {hydrate} from './scripts.js'
            hydrate(${JSON.stringify(model)}, document.getElementById('app'))
        </script>

    </head>

    <body>
        <div id="app">
            ${body(render, model)}
        </div>
    </body>

</html>`;
