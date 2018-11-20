import { CCElement } from "/elements/cc-button.js";
import { MyElement } from "/elements/my-element.js";

export const register = () => {
  window.customElements.define("cc-button", CCElement);
  window.customElements.define("my-element", MyElement);
};
