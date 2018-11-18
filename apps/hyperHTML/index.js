import viperHTML from "viperhtml";

import { markup } from "./dom.js";

module.exports = ({ data }) => markup(viperHTML(), data);
