import { html, render } from "https://unpkg.com/lit-html?module";

import { createAppTemplateResult } from "./templates.js";

export const hydrate = (data, node) => {
  render(createAppTemplateResult(html, data), node);

  setTimeout(() => {
    render(
      createAppTemplateResult(html, {
        ...data,
        name: "LIT"
      }),
      node
    );
  }, 0);
};

export const init = () => {
  console.log("init");
};
