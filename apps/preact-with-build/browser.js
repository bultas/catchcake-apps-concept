// import ReactDOM from "react-dom";
import { render } from "preact";

import { createAppElement } from "./src/index.js";

export default async data => {
  const AppElement = await createAppElement({
    ...data,
    data: { name: "honov" }
  });
  // render(AppElement, document.querySelector(`#app`));
  setTimeout(() => {
    render(
      AppElement,
      document.getElementById("app"),
      document.getElementById("app").children[0]
    );
  }, 2000);
};
