import { html, render } from "/node_modules/lit-html/lit-html.js";

import { Machine, actions } from "https://unpkg.com/xstate/es/index.js";
import { interpret } from "https://unpkg.com/xstate/es/interpreter.js";

import { register } from "/modules/register.js";
import { createAppTemplateResult } from "/modules/templates.js";

const { assign } = actions;

const DOMMachine = Machine(
  {
    id: "app",
    initial: "init",
    context: {},
    states: {
      init: {
        on: {
          INIT: {
            target: "initialized",
            actions: ["update"]
          }
        }
      },
      initialized: {
        onEntry: ["render"],
        after: {
          100: "rendered" // wait for full DOM hydratation to allow CSS custom-elements transitions etc.
        }
      },
      rendered: {
        onEntry: ["register"],
        after: {
          0: "registered"
        }
      },
      registered: {
        on: {
          UPDATE: {
            actions: ["update", "render"]
          }
        }
      }
    }
  },
  {
    actions: {
      update: assign((ctx, { payload }) => payload),
      render: ctx => {
        render(
          createAppTemplateResult(html, ctx),
          document.getElementById("app")
        );
      },
      register: () => {
        register();
      }
    }
  }
);

export const DOMService = interpret(DOMMachine);
