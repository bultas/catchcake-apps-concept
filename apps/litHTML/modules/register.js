import { CCElement } from "/modules/elements/cc-button.js";
import { createCCInput } from "/modules/elements/cc-input.js";
import { MyElement } from "/modules/elements/my-element.js";

export const register = send => {
  const CCInput = createCCInput(send);

  window.customElements.define("cc-button", CCElement);
  window.customElements.define("cc-input", CCInput);
  window.customElements.define("my-element", MyElement);
};
