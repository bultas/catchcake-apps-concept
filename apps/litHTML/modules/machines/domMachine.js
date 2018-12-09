import { Machine } from "xstate";

export const DOMMachine = Machine({
  id: "DOM",
  initial: "install",
  states: {
    install: {
      on: {
        RENDER: {
          target: "hydrating",
          actions: ["renderDOM"]
        }
      }
    },
    // wait for full DOM hydratation to allow CSS custom-elements transitions etc.
    hydrating: {
      after: {
        1: "hydrated"
      }
    },
    hydrated: {
      onEntry: ["registerElements"],
      after: {
        0: "rendered" // how to do self transition better after actions
      }
    },
    rendered: {
      on: {
        RENDER: {
          actions: ["renderDOM"]
        }
      }
    }
  }
});
