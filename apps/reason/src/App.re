/* let component = <MyComponent />

component(); */
type reactClass;

type element;

[@bs.val] external null : element = "null";

external string : string => element = "%identity";

[@bs.module "preact"]
external h : (string, ~props: Js.t({..}), array(element)) => element = "h";

[@bs.module "preact"]
external render : (element, Dom.element) => unit = "render";


let obj = [%bs.obj {author: "Bob"}];

let headline = h("h2", obj, [| string("child") |]);

Js.log(Module.hubala)


[@bs.val]
external _getElementById : string => Dom.element = "document.getElementById";

/* [@bs.val] [@bs.return nullable]
external _getElementById : string => option(Dom.element) = "document.getElementById"; */

let elementId = _getElementById("app");

let element = h("h1", obj, [| string("Hello Daniel"), headline |]);

render(element, elementId)

