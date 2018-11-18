// import React from "react";
import { h } from "preact";

const onClick = async () => {
  const { getAsyncNeco } = await import("./async.js");
  const result = await getAsyncNeco();
  console.log(result);
};

export const Simple = ({ data: { name } }) => {
  return h("button", { onClick }, `Hello ${name}`);
};
