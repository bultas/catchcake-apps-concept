import { html, render } from "/node_modules/lit-html/lit-html.js";
import { register } from "/modules/register.js";
import { createAppTemplateResult } from "/modules/templates.js";

const initialState = window.initialState;

render(
  createAppTemplateResult(html, initialState),
  document.getElementById("app")
);

// wait for full DOM hydratation to allow CSS custom-elements transitions etc.
setTimeout(() => {
  register();
}, 0);
