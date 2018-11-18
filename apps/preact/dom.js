const Headline = (render, name) => {
  return render("h1", null, name);
};

const Content = (render, content) => {
  return [
    render("p", null, content),
    render(
      "special-button",
      {
        onClick: () => {
          console.log("click");
        }
      },
      "click me"
    )
  ];
};

export const body = (render, { name, content }) => {
  return render("div", null, [
    Headline(render, name),
    Content(render, content)
  ]);
};

export const markup = (base, data) => `<!DOCTYPE html>
<html>
    <head>

        <title>Custom Elements</title>

        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <script type="module">
            import {hydrate} from './scripts.js'
            hydrate(${JSON.stringify(data)}, document.getElementById('app'))
        </script>

    </head>

    <body>
        <div id="app">
            ${base}
        </div>
    </body>

</html>`;
