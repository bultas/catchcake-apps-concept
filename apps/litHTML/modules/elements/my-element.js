import { LitElement, html } from "@polymer/lit-element";

export class MyElement extends LitElement {
  static get properties() {
    return {
      content: { type: String }
    };
  }
  // constructor() {
  //   super();
  // }
  render() {
    const { content } = this;
    return html`
      <h2>${content}</h2>
      <input
        @blur="${
          e => {
            console.log(e);
          }
        }"
        value="${content}"
      />
    `;
  }
}
