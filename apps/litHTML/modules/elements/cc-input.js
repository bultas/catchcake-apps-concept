export const createCCInput = send =>
  class CCInput extends HTMLElement {
    static get observedAttributes() {
      return ["value"];
    }

    constructor() {
      super();
    }

    attributeChangedCallback(attribute, value, newValue) {
      console.log(attribute, value, newValue);

      if (value) {
        this.input.setAttribute(attribute, newValue);
      }
    }

    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });

      this.input = document.createElement("input");

      this.input.setAttribute("value", this.getAttribute("value"));

      this.input.addEventListener("blur", e => {
        send({
          type: "INPUT_CHANGE",
          payload: e.target.value
        });
      });

      shadow.appendChild(this.input);
    }
  };
