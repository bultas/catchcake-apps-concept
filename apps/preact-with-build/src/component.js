// import React from "react";
import { h } from "preact";

export const Component = ({ data: { name } }) => {
  return h("div", null, [h("div", null, "name:"), h("div", null, name)]);
};
