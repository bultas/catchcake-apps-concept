import React from "react";

export const createAppElement = async ({ data, path }) => {
  if (path === "/simple") {
    return import(`./simple.js`).then(({ Simple }) => {
      return React.createElement(Simple, { data, path });
    });
  }

  return import(`./component.js`).then(({ Component }) => {
    return React.createElement(Component, { data, path });
  });
};
