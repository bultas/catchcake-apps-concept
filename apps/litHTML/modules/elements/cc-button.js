export class CCElement extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", async e => {
      // example of dynamic import with relative path
      const modulePath = "/utils/sayHi.js";
      const { hi } = await import("/modules/sayHi.js");
      hi(this.getAttribute("value"));
    });
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
        :host {
          // all: initial;
          transition: all 0.5s ease;
          display: inline-block;
          contain: content;
  
          color: #fff;
          background: #24b33f;
          padding: 10px;
          cursor: pointer;
        }
        :host(:hover) {
          background: #158a2b;
        }
      `;

    shadow.appendChild(style);

    // const button = document.createElement("div");
    // button.textContent = this.childNodes[0].textContent;

    shadow.appendChild(this.childNodes[0]);

    // const event = new CustomEvent("hello-event", {});
    // this.addEventListener("click", e => {});
  }
}
