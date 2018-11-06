import React from "react";

const onClick = async () => {
  const { getAsyncNeco } = await import("./async.js");
  const result = await getAsyncNeco();
  console.log(result);
};

export const Simple = ({ data: { name } }) => {
  return React.createElement("button", { onClick }, `Hello ${name}`);
};
