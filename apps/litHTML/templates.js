export const headline = (r, { name }) => r`
      <h1>${name}</h1>
  `;

export const content = (r, { content, onClick }) => r`
    <style> p { color: #999; }</style>
    <p>${content}</p>
    <special-button @click=${onClick}>Click Me</special-button>
`;

const onClickEvent = () => {
  console.log("click");
};

export const createAppTemplateResult = (r, data) => r`
      ${headline(r, { name: data.name })}
      ${content(r, { content: data.content, onClick: onClickEvent })}
  `;
