// import { render } from "./elements/my-element.js";

const createLogEvent = type => e => console.log(type, e);

// export const headline = (r, { name }) => r`
//     <h1>${name}</h1>
//   `;

// export const content = (r, { content, onClick, onChange }) => r`
//     <p>${content}</p>
//     <input type="text" value=${content} @input=${onChange} />
//     <cc-button @click=${onClick}>Click Me</cc-button>
// `;

// export const createAppTemplateResult = (r, data) => r`
//     ${headline(r, { name: data.name })}
//     ${content(r, {
//       content: data.content,
//       onClick: createLogEvent("click"),
//       onChange: createLogEvent("input")
//     })}
//   `;

export const createAppTemplateResult = (html, data) => html`
  <h1>${data.name}</h1>
  <p>${data.content}</p>

  <input type="text" value="${data.name}" @input="${createLogEvent("input")}" />

  <cc-button @click="${createLogEvent("click")}"> Click Me </cc-button>

  <my-element></my-element>
`;
