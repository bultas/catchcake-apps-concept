import React from "react";

const getComponent = async () => {
  const { Component } = await import("./component.js");
  return Component;
};

export const App = async ({ data: { name }, path }) => {
  const Component = await getComponent();
  console.log(Component);

  return React.createElement(Component, { name, path });
};

// export const dynamic = async () => {
//   const Component = await import("./component.js");
//   return Component;
// };

// export const dynamic = async () => {
//   const { Component } = await import("./component.js");
//   return Component;
// };
