import React from "react";

export const Component = ({ name, path }) => {
  return [
    React.createElement("div", null, name),
    React.createElement("div", null, path)
  ];
};
