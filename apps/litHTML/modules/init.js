import { html, render } from "/node_modules/lit-html/lit-html.js";
import { register } from "/modules/register.js";
import { createAppTemplateResult } from "/modules/templates.js";

import { interpret } from "https://unpkg.com/xstate/es/interpreter.js";
import { Machine, actions } from "https://unpkg.com/xstate/es/index.js";

import { DOMMachine } from "/modules/machines/domMachine.js";

const { assign } = actions;

const storeMachine = Machine(
  {
    id: "store",
    initial: "ready",
    states: {
      ready: {
        on: {
          INPUT_CHANGE: {
            actions: ["update"]
          }
        }
      }
    }
  },
  {
    actions: {
      update: assign((ctx, { payload }) => {
        return {
          name: payload
        };
      })
    }
  }
).withContext(window.initialState.data);

const storeService = interpret(storeMachine);

const DOMMachineService = interpret(
  DOMMachine.withConfig({
    actions: {
      renderDOM: (ctx, { payload }) => {
        render(
          createAppTemplateResult(html, payload),
          document.getElementById("app")
        );
      },
      registerElements: () => {
        register(storeService.send);
      }
    }
  })
);
DOMMachineService.start();

storeService.onTransition(({ value, context }) => {
  DOMMachineService.send({
    type: "RENDER",
    payload: context
  });
});

storeService.start();
