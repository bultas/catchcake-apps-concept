import React from "react";

export const Component = ({ data: { name } }) => {
  return React.createElement("div", null, name);
};
