import { bind, wire } from "https://unpkg.com/hyperhtml@latest/esm";

import { body } from "./dom.js";

export const hydrate = (data, node) => {
  setTimeout(() => {
    bind(node)`${body(wire(), data)}`;
  }, 2000);
};
