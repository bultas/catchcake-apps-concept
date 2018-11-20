import { html, render } from "https://unpkg.com/lit-html?module";

import { createAppTemplateResult } from "/templates.js";
import { register } from "/register.js";

export const hydrate = (data, node) => {
  render(createAppTemplateResult(html, data), node);

  // setTimeout(() => {
  //   render(
  //     createAppTemplateResult(html, {
  //       ...data,
  //       name: "LIT"
  //     }),
  //     node
  //   );
  // }, 2000);
};

export const init = () => {
  register();
};
