// import React from "react";
import { h } from "preact";

export const createAppElement = async ({ data, path }) => {
  if (path === "/simple") {
    return import(`./simple.js`).then(({ Simple }) => {
      return h(Simple, { data, path });
    });
  }

  return import(`./component.js`).then(({ Component }) => {
    return h(Component, { data, path });
  });
};
