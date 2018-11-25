import { DOMService } from "/modules/machines.js";

DOMService.onTransition(nextState => {
  console.log(nextState.value);
});

DOMService.start();

DOMService.send({ type: "INIT", payload: window.initialState });

setTimeout(() => {
  DOMService.send({
    type: "UPDATE",
    payload: {
      data: {
        name: "X machina",
        content: "super cooler lorem psum"
      },
      path: "/"
    }
  });
}, 1000);

// DOMService.stop();
