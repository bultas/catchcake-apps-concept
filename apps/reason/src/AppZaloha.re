/* let sayHello = (clickHandler) =>
  Render.html(
    {j|
      <h1>Hell </h1>
      <p>Goodbye</p>
      <button @click=$(clickHandler)>
        <span>This is nested</span>
      </button >
    |j},
  );

let hello = [%raw
  {|
    (clickHandler) => LitHtml.html`
      <h1>Hello ${name}!</h1>
      <p>Goodbye</p>
      <button @click=${clickHandler}>
        <span>This is nested</span>
      </button>
    `
  |}
]; */

/* let sayHello = fun%raw (clickHandler) => "LitHtml.html`<button @click=${clickHandler}>Click me</button>`"; */


/* let render = [%raw
  {|
    (clickHandler) => LitHtml.html`
      ${getTree(clickHandler)}
    `
  |}
]; */


let clickHandler = () => {};


/* let nested = (value) => {j|<span>This is $value</span>|j};

let base = (child) => {j|
  <button @click=$clickHandler>
    $(child)
  </button >
|j}; */

/* let app = Render.html(base(nested("hello"))); */

/* let app = Render.templator([|"<h1>", "</h1>"|], [|"value"|]); */

let name = "Daniel"

let re = (content) => Render.html([%raw
  {|`${content}`|}
]);

/* let app = Render.html([%raw
  "`<button>${name}</button>`"
]); */

let buttonComponent = (name) => re({j|<button>$name</button>|j});

let wrapperComponent = (content) => re({j|<div>$content</div>|j})

let app = wrapperComponent(buttonComponent("honza"));

/* let app = buttonComponent("honza"); */

[@bs.val]
external _getElementById : string => Dom.element = "document.getElementById";

let elementId = _getElementById("app");

/* Render.render(app(. () => { Js.log("hkuk")}), elementId); */
Render.render(app, elementId);

/* Render.render(sayHello(. () => { Js.log("hkuk")}), elementId); */
/* Render.render(hello(. () => { Js.log("hkuk")}), elementId); */