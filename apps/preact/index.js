import render from "preact-render-to-string";
import { h } from "preact";

import { markup, body } from "./dom.js";

module.exports = ({ data }) => markup(render(body(h, data)), data);
