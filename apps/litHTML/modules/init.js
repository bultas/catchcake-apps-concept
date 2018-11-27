import { html, render } from "lit-html";
import { register } from "./register.js";
import { createAppTemplateResult } from "./templates.js";

import { interpret } from "xstate/es/interpreter";
import { Machine, actions } from "xstate/es/";

import { DOMMachine } from "./machines/domMachine.js";

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
