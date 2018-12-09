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

export const createAppTemplateResult = (html, { name, content }) => html`
  <h1>${name}</h1>
  <p>${content}</p>

  <div>
    <cc-input is="input" value="${name}"></cc-input>

    <cc-input is="input" value="${name}"></cc-input>

    <input is="cc-input" value="${name}" />

    <cc-button value="SAVE_BUTTON_CLICKED">Click Me</cc-button>
  </div>

  <div>
    <my-element content="${name}"> <div>SEO</div> </my-element>
  </div>
`;
