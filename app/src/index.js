import React from "react";

import { Component } from "./component.js";

export const App = ({ data: { name }, path }) => {
  return React.createElement(Component, { name, path });
};
