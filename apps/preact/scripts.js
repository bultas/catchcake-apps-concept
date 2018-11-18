import { h, render } from "https://cdn.jsdelivr.net/npm/preact/dist/preact.mjs";

import { body } from "./dom.js";

export const hydrate = (data, node) => {
  setTimeout(() => {
    render(body(h, data), node, node.children[0]);
  }, 2000);

  setTimeout(() => {
    render(body(h, { ...data, name: "Changed" }), node, node.children[0]);
  }, 4000);
};
