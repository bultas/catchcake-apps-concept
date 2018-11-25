import { html, render } from "/node_modules/lit-html/lit-html.js";
import { register } from "/modules/register.js";
import { createAppTemplateResult } from "/modules/templates.js";

import { interpret } from "https://unpkg.com/xstate/es/interpreter.js";
import { DOMMachine } from "/modules/machines/domMachine.js";

const renderDOM = (ctx, { payload }) =>
  render(
    createAppTemplateResult(html, payload),
    document.getElementById("app")
  );

const registerElements = () => register();

export const DOMService = interpret(
  DOMMachine.withConfig({
    actions: {
      renderDOM,
      registerElements
    }
  })
);

// DOMService.onTransition(nextState => {
//   console.log(nextState.value);
// });

DOMService.start();

DOMService.send({
  type: "RENDER",
  payload: window.initialState
});

setTimeout(() => {
  DOMService.send({
    type: "RENDER",
    payload: {
      data: {
        name: "X machina",
        content: "super cooler lorem psum"
      },
      path: "/"
    }
  });
}, 2000);

// DOMService.stop();
