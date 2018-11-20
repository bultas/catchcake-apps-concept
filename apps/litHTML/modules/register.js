import { CCElement } from "/modules/elements/cc-button.js";
import { MyElement } from "/modules/elements/my-element.js";

export const register = () => {
  window.customElements.define("cc-button", CCElement);
  window.customElements.define("my-element", MyElement);
};
