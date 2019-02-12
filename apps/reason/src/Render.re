type templateResult;

/* [@bs.module "lit-html"]
external html_ : (. array(string)) => templateResult = "html"; */

[@bs.module "lit-html"]
external html_ : (. array(string)) => templateResult = "html";

type templateProcessor = {.};

[@bs.module "lit-html"] 
external defaultTemplateProcessor : templateProcessor = "defaultTemplateProcessor";

[@bs.module "lit-html"] [@bs.new]
external templateResult : (array(string), array(string), string, templateProcessor) => templateResult = "TemplateResult";

[@bs.module "lit-html"]
external render : (templateResult, Dom.element) => unit = "render";

[@bs.val] [@bs.return nullable]
external _getElementById : string => option(Dom.element) =
  "document.getElementById";

/* let html = htmlString => html_(. [|htmlString|]); */

let html = htmlString => html_(. [|htmlString|]);


let templator = (strings, values) => templateResult(strings, values, "html", defaultTemplateProcessor)

/* let doHtml = (array) => html_(array) */

let renderWithId = (templateResult, id) =>
  switch (_getElementById(id)) {
  | None =>
    raise(
      Invalid_argument(
        "LitHtml.renderToElementWithId : no element of id "
        ++ id
        ++ " found in the HTML!",
      ),
    )
  | Some(element) => render(templateResult, element)
  };